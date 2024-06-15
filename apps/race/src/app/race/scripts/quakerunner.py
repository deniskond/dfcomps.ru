import json
import aiohttp
import asyncio
import lxml.html.soupparser as htmlparser
import math
import os
import subprocess
import sys
import threading
import time
import queue
import re
# import websockets
import zipfile
from aiohttp import web

from typing import Dict, List


RACE_SERVER_VERSION_INFO=json.dumps({"version": (1, 0, 0)})
GAME="quake3e.ded.x64"


def uniq(it, key):
    d = set()
    for i in it:
        k = key(i)
        if k in d: continue
        d.add(k)
        yield i

def strftime(msec):
    mm = int(msec)
    ms = mm % 1000
    s = (mm // 1000) % 60
    m = (mm // 60000) % 60
    h = (mm // 3600000)
    if h > 0:
        return f"{h}:{m:02}:{s:02}.{ms:03}"
    if m > 0:
        return f"{m:02}:{s:02}.{ms:03}"
    return f"{s}.{ms:03}"

color_re = re.compile(r'\^.')
def remove_colors(string):
    return color_re.sub("", string).lower()

class command_stream:
    def __init__(self, process: subprocess.Popen):
        self.process = process
        self._terminated = False
        self._recv_queue = asyncio.Queue()
        self._send_queue = queue.Queue()
        # self._send_queue_ack = asyncio.Queue()
        self._termination = asyncio.Queue()
        self._thread = threading.Thread(target=lambda: self.__pipe_recv())
        self._thread.start()
        # self.__log = []

    def __pipe_recv(self):
        if self.process.stderr is None:
            return
        while not self._terminated and self.process.poll() is None:
            # print("to_recv")
            out = self.process.stderr.readline()
            # print("recv")
            # print(out.decode('ascii'))
            # self.__log.append(out)
            self._recv_queue.put_nowait(out)
        self.process.wait()
        self._termination.put_nowait(())

    async def send(self, command):
        if self.process.stdin is None: return
        if self._terminated: return
        # self.process.communicate(command + b'\n')
        # print('>: ' + (command + b'\n').encode('ascii'))
        self.process.stdin.write(command + b'\n')
        self.process.stdin.flush()

    async def recv(self) -> bytes:
        if self._terminated: return b''
        return await self._recv_queue.get()

    def shutdown(self):
        self._terminated = True
        self.process.terminate()

    def is_closed(self):
        return self._terminated

    async def wait_shutdown(self):
        self._terminated = True
        await asyncio.sleep(0.1)
        if self._thread.is_alive():
            try:
                await asyncio.wait_for(self._termination.get(), 5.0)
            except TimeoutError:
                self.process.kill()


class quake_factory:
    def __init__(self, bin_path, config=[]):
        self.binary = bin_path
        self.config = config

    def run(self, config_override=[]) -> command_stream:
        return command_stream(
            subprocess.Popen(self.comand_line([*self.config, *config_override]), stderr=subprocess.PIPE, stdin=subprocess.PIPE)
        )

    def comand_line(self, config):
        cl = [self.binary,  *(f'+{v}' for v in config)] # for x in ('+' + v.strip()).split(' '))]
        print(cl)
        return cl

class map_info:
    def __init__(self, name, config=[], est_time=None):
        self.name = name
        self.config = config if config is not None else []
        self.est_time = est_time

    @classmethod
    def from_dict(cls, d: dict):
        if d is None: return None
        if isinstance(d, str): return map_info(d)
        if not isinstance(d, dict): return None
        if "mapName" not in d: return None
        n = d["mapName"]
        cfg = d.get("config", [])
        if not isinstance(cfg, list): cfg = []
        cfg = [x for x in cfg if x]
        if any((not isinstance(x, str) for x in cfg)): cfg = []
        est = d.get("estTime", -1)
        if not isinstance(est, int) and not isinstance(est, float): est = -1
        if est < 0: est = -1
        return map_info(n, cfg, est)

    def __str__(self) -> str:
        return f"{self.name}[{self.est_time}] <{self.config}>"
    def __repr__(self) -> str:
        return f"{self.name}[{self.est_time}] <{self.config}>"

class rules:
    def __init__(self, maps=[], warmup_map="tr1ckhouse-beta3", warmup_time=3000, max_disconnects=3, reconnect_timeout=20, afterlevel_time=0.5, aftermatch_time=120, beforestart_gap=3.0):
        self.warmup_map = warmup_map
        self.warmup_time = warmup_time
        self.max_disconnects = max_disconnects
        self.reconnect_timeout = reconnect_timeout
        self.afterlevel_time = afterlevel_time
        self.aftermatch_time = aftermatch_time
        self.beforestart_gap = beforestart_gap
        self.maps = maps

class message:
    def __init__(self, player, msgtype, content):
        self.time = time.time()
        self.player = player
        self.type = msgtype
        self.content = content

class race_game:
    def __init__(self, quakepath, rules: rules, player_ports, report_hook, reset_hook):
        self.__color_re = re.compile(r'\^.')
        self.quakepath = quakepath
        self.rules = rules
        self.maplist: List[map_info] = rules.maps
        self.players = player_ports #set([self.__remove_colors(p) for p in players])
        self.events = asyncio.Queue()
        self.report_hook = report_hook
        self.reset_hook = reset_hook
        self.gamestate = {
            player: {
                "times": [{"map": m.name, "start": None, "end": None, "demo": None} for m in self.maplist],
                "ready": False,
                "finished": False,
                "disqualified": False,
                "connected": False,
                "disconnects": 0,
                "last_disconnect_id": 0,
                "current_map": -1,
            }
            for player, _ in self.players
        }
        self.processes: Dict[str, command_stream] = {}
        self.stage = "warmup" # : "warmup" | "race" | "complete" | "shutdown"
        self.countdown = asyncio.Queue()
        self.countdown_stage = 0
        self.countdown_phrases = [
            "say ^2All players are ready!",
            "say ^33",
            "say ^32",
            "say ^31",
            "say ^1GO!",
            None
        ]

    @staticmethod
    def get_stage(gs):
        if gs["disqualified"]: return "Disqualified"
        if gs["finished"]: return "Finished"
        if gs["current_map"] < 0:
            if gs["ready"]: return "Ready"
            return "Warmup"
        return "Running"

    def get_current_stage(self):
        def p(v):
            x = min(0, v)
            return -math.exp(x) + 1
        result = {}
        for player, gs in self.gamestate.items():
            cur = gs["current_map"]
            progress = 1.0
            if cur >= 0 and gs["times"][cur]["end"] is None:
                progress = 0.0
                start = gs["times"][cur]["start"]
                est = self.maplist[cur].est_time
                if start is not None and est > 0:
                    # print(f"[{player}]: {(start - time.time()) / est}  {p((start  - time.time()) / est)}")
                    progress = p((start - time.time()) / est)
            result[player] = {
                "stage": race_game.get_stage(gs),
                "currentMap": cur,
                "progress": progress,
            }
        return result

    async def prepare(self, custom_config=[]):
        binpath = os.path.join(self.quakepath, GAME)
        modpath = os.path.join(self.quakepath, "defrag")
        if not os.path.exists(binpath):
            return {"err": {"code": "BadConfig", "message": f"ioquake3 dedicated server is not found at '{binpath}'"} }
        if not os.path.exists(modpath):
            return {"err": {"code": "BadConfig", "message": f"Defrag is not found at '{modpath}'"} }
        # ensure maplist is fully presented
        listmaps = []
        for i in os.listdir(modpath):
            if i.endswith('.pk3'):
                with zipfile.ZipFile(os.path.join(modpath, i)) as f:
                    listmaps += [os.path.basename(x.filename[:-4]).lower() for x in f.filelist if x.filename.endswith('.bsp')]
        print(listmaps)
        reqmaps = self.maplist + [map_info.from_dict({"mapName": self.rules.warmup_map})]
        todownload = [x.name for x in reqmaps if x.name.lower() not in listmaps]
        urls = list(uniq(zip(todownload, await asyncio.gather(*[self.get_ref(x) for x in todownload])), key=lambda x: x[1]))
        print(urls)
        errors = [y for y in await asyncio.gather(*[self.download(x[0], x[1]) for x in urls]) if y is not None]
        if len(errors) > 0:
            return {"err": {"code": "InternalError", "message": f"Failed to download maps:\n" + '\n'.join(errors)} }
        print(self.players)
        qf = quake_factory(binpath, [
            "set fs_game defrag",
            *custom_config,
            f"map {self.rules.warmup_map}",
            # [FIXME] add required config!
        ])
        await asyncio.sleep(1.0)
        for player, port in self.players:
            self.processes[player] = qf.run([f"set net_port {port}"])
            print(f"Player '{player}' is running on port {port}")
        
        await asyncio.sleep(1.0)

        await self.broadcast(f"map {self.rules.warmup_map}")
        return {"result": self.players}

    async def run(self):
        res, *_ = await asyncio.gather(*[self.__main_task(), self.__alive(), self.__countdown_task(), self.__all_recv_task(), self.__waitforplayers_task()])
        print("run dead")
        return res

    async def broadcast(self, message: str, exclude=[]):
        await asyncio.gather(*[x.send(message.encode('ascii')) for k,x in self.processes.items() if not x.is_closed() and k not in exclude])

    async def send(self, player, message):
        await self.processes[player].send(message.encode('ascii'))

    def __remove_colors(self, string):
        return self.__color_re.sub("", string).lower()
    
    # def __overall_cancellation(self):
    #     if self.cancellation_task is not None:
    def terminate(self, manual=False):
        self.events.put_nowait(message(None, "system", {"type": "terminate", "manual": manual}))

    async def __alive(self):
        while self.stage != "shutdown":
            # print('tick')
            await self.broadcast("")
            await asyncio.sleep(1.0)
        print("__alive dead")

    async def __all_recv_task(self):
        await asyncio.gather(*[self.__recv_task(x) for x in self.processes])
        print("__all_recv_task dead")

    async def __go_map(self, cur, player=None):
        cfg = [x for x in self.maplist[cur].config]
        cfg.append(f"map {self.maplist[cur].name}")
        print(f"Starting map: {cfg}")
        if player is None:
            await self.broadcast("; ".join(cfg))
        else:
            await self.send(player, "; ".join(cfg))

    async def __main_task(self):
        try:
            is_terminated = False
            is_manual_terminate = False
            while self.stage != "shutdown":
                msg: message = await self.events.get()
                print(f'message [{msg.player}]: {msg.content}')
                player = msg.player
                if msg.type == "say":
                    gs = self.gamestate[msg.player]
                    cmdplayer = msg.content["player"]
                    msgtext = msg.content["message"]
                    if msgtext.startswith('!'):
                        if self.__remove_colors(msg.player) == cmdplayer:
                            if msgtext == "!giveup":
                                gs["finished"] = True
                                gs["disqualified"] = True
                                await self.broadcast(f"say ^3Player ^7{player} ^3gave up!")
                                # run next map
                                if all((x["finished"] for x in self.gamestate.values())):
                                    # all players finished round
                                    print(f"EVERYONE IS FINISHED!")
                                    self.stage = "complete"
                                    break
                            elif self.stage == "warmup":
                                if msgtext == "!ready":
                                    gs["ready"] = True
                                    # check for all ready
                                    await self.broadcast(f"say ^3Player ^7{player} ^3is ready!")
                                    if all((x["ready"] for x in self.gamestate.values())):
                                        self.countdown_stage = 0
                                        for i in self.countdown_phrases:
                                            self.countdown.put_nowait(i)
                                        self.stage = "race"
                                elif msgtext == "!unready":
                                    if self.countdown_stage < 2:
                                        gs["ready"] = False
                                        # abort countdown
                                        while not self.countdown.empty():
                                            try:
                                                self.countdown.get_nowait()
                                            except asyncio.QueueEmpty:
                                                break
                                        self.stage = "warmup"
                                        await self.broadcast("say ^8Countdown aborted!")
                                    else:
                                        await self.send(player, f"say ^1Too late for unready!")
                        else:
                            await self.send(player, f"say ^8You are not registered for round with {player} name!")
                    else:
                        await self.broadcast(f"say {cmdplayer}: ^6{msgtext}", [player])
                elif msg.type == "join":
                    gs = self.gamestate[msg.player]
                    cmdplayer = msg.content["player"]
                    event = msg.content["event"]
                    if self.__remove_colors(player) == cmdplayer:
                        cmap = gs["current_map"]
                        if cmap >= 0 and self.stage == "race": # race is going on
                            if event == "join":
                                print(f"Player {player} joined {cmap}!")
                                if not gs["connected"]:
                                    gs["connected"] = True
                                # player reconnected, last_disconnect_id is invalidated
                                gs['last_disconnect_id'] += 1
                                curmap = gs["times"][cmap]
                                if curmap["start"] is None:
                                    curmap["start"] = msg.time
                            elif event == "disconnect":
                                # player disconnected, start timer to reconnect
                                asyncio.create_task(self.__disconnect_timer(msg.player, gs['last_disconnect_id']))

                                gs["disconnects"] += 1
                                if gs["disconnects"] > self.rules.max_disconnects:
                                    gs["disqualified"] = True
                                if gs["connected"]:
                                    gs["connected"] = False
                                curmap = gs["times"][cmap]
                                if curmap["start"] is not None:
                                    curmap["start"] = None
                                # restart map and wait for next connection
                                await self.__go_map(cmap, player)
                                # await self.send(player, f"map {self.maplist[cmap].name}")
                elif msg.type == "finish":
                    gs = self.gamestate[msg.player]
                    cmdplayer = msg.content["player"]
                    demotime = msg.content["time"]
                    if self.__remove_colors(player) == cmdplayer:
                        cmap = gs["current_map"]
                        curmap = gs["times"][cmap]
                        if curmap["start"] is not None:
                            curmap["end"] = msg.time
                            curmap["demo"] = demotime
                            # run next map
                            if cmap == len(self.maplist) - 1:
                                gs["finished"] = True
                                await self.broadcast(f"say ^3Player ^7{player} ^3is finished!")
                                if all((x["finished"] for x in self.gamestate.values())):
                                    # all players finished round
                                    print(f"EVERYONE IS FINISHED!")
                                    self.stage = "complete"
                                    break
                            
                            asyncio.create_task(self._go_to_next_map(player))

                elif msg.type == "system":
                    mtype = msg.content["type"]
                    if mtype == "wait_end" and self.stage == "warmup":
                        to_disconnect = []
                        for p, g in self.gamestate.items():
                            if g["connected"] == False:
                                # required player is not connected
                                to_disconnect.append(p)
                        for p in to_disconnect:
                            await self.send(p, "quit")
                            self.processes[p].shutdown()
                            del self.processes[p]
                        if len(self.processes) < 2:
                            # all players but at least one are done
                            is_terminated = True
                            break
                    elif mtype == "start":
                        for p, g in self.gamestate.items():
                            g["current_map"] = 0
                        await self.__go_map(0, None)
                        # await self.broadcast(f"map {m}")
                        # await asyncio.gather(*[x.send(f"map {m}") for x in self.processes.values()])
                    elif mtype == "reconnect":
                        gs = self.gamestate[msg.player]
                        if "disconnect_id" in msg.content and msg.content["disconnect_id"] == gs["last_disconnect_id"]:
                            # player failed to reconnect
                            gs["finished"] = True
                            gs["disqualified"] = True
                            await self.broadcast(f"say ^3Player ^7{player} ^3is not reconnected!")
                            # run next map
                            if all((x["finished"] for x in self.gamestate.values())):
                                # all players finished round
                                print(f"EVERYONE IS FINISHED!")
                                self.stage = "complete"
                                break
                    elif mtype == "terminate":
                        is_terminated = True
                        is_manual_terminate = msg.content["manual"]
                        break
            if not is_terminated:
                await self.broadcast("say ^2ROUND FINISHED!")
                await asyncio.sleep(1.0)

                playertimes = []
                for p, g in self.gamestate.items():
                    t = g["times"]
                    dis = False
                    sum_time = 0
                    sum_demo = 0
                    for tms in t:
                        if tms["start"] is None or tms["end"] is None or tms["demo"] is None:
                            dis = True
                            break
                        # apply time gap before start as a reserve (if zero, end - start is always greater than demo)
                        sum_time += max(tms["end"] - tms["start"] - self.rules.beforestart_gap, tms["demo"] * 1.0e-3)
                        print(f"{p} sum time: {sum_time}, {tms['end'] - tms['start']}, {tms['end'] - tms['start'] - self.rules.beforestart_gap}, {tms['demo']}")
                        sum_demo += tms["demo"]
                    if dis:
                        playertimes.append((p, None, None, False, t))
                    else:
                        playertimes.append((p, sum_time, sum_demo, not g["disqualified"], t))
                
                playertimes.sort(key=lambda x: (1e100, 1e100) if x[1] is None else (x[1], x[2]))
                await self.report_hook({"players": [x[0] for x in self.players], "times": playertimes})

                print(self.players)
                print(playertimes)
                maxlen = max([len(p) for p, _ in self.players])
                def rowformat(name, t, dt, valid):
                    if t is None:
                        return f"\"^3| {{:>{maxlen}}} | ^1{{:>15}}^3 | ^1{{:>15}}^3 |\"".format(name, "NF", "NF")
                    else:
                        if valid:
                            return f"\"^3| {{:>{maxlen}}} | {{:>15}} | {{:>15}} |\"".format(name, t, dt)
                        else:
                            return f"\"^3| {{:>{maxlen}}} | ^1{{:>14}}*^3 | ^1{{:>14}}*^3 |\"".format(name, t, dt)
                    
                await self.broadcast(f"say {rowformat('player', '     time', '   demo time', True)}")
                await self.broadcast(f"say \"^3|{'-'*(maxlen+2)}|-----------------|-----------------|\"")
                for p, t, dt, valid, *_ in playertimes:
                    if t is None or dt is None:
                        await self.broadcast(f"say {rowformat(p, None, None, True)}")
                    else:
                        await self.broadcast(f"say {rowformat(p, strftime(t * 1000), strftime(dt), valid)}")

                await asyncio.sleep(20.0)
            else:
                if not is_manual_terminate and self.reset_hook is not None:
                    await self.reset_hook()
                await self.broadcast("say ^2ROUND TERMINATED! ^3SORRY ^2X^5_^2X")

            return not is_terminated
        finally:
            for i in self.processes.values():
                try:
                    i.shutdown()
                except Exception as e:
                    print(e)
            await asyncio.gather(*[x.wait_shutdown() for x in self.processes.values()])
            print(f"Shotdown!")
            self.stage = "shutdown"
            self.countdown.put_nowait(None)

    async def _go_to_next_map(self, player):
        gs = self.gamestate[player]
        cmap = gs["current_map"]
        cmap += 1
        if cmap < len(self.maplist):
            print(f"next map is {self.maplist[cmap].name}")
            gs["current_map"] = cmap
            await self.send(player, f"say ^3Going to {self.maplist[cmap].name}")
            await asyncio.sleep(self.rules.afterlevel_time)
            await self.__go_map(cmap, player)
        else:
            print(f"round done!")
            await self.send(player, f"map {self.rules.warmup_map}")


    async def __countdown_task(self):
        while self.stage != "shutdown":
            e = await self.countdown.get()
            if e is None:
                break
            await self.broadcast(e)
            self.countdown_stage += 1
            await asyncio.sleep(1.0)
        self.events.put_nowait(message(None, "system", {"type": "start"}))
        print("__countdown_task dead")
        

    async def __waitforplayers_task(self):
        towait = time.time() + self.rules.warmup_time
        while self.stage != "shutdown":
            delta = towait - time.time()
            if delta <= 0:
                self.events.put_nowait(message(None, "system", {"type": "wait_end"}))
                break
            await asyncio.sleep(min(1.0, delta)) # wait two minutes to connect players
        print("__waitforplayers_task dead")

    async def __disconnect_timer(self, player, disconnect_id):
        await asyncio.sleep(self.rules.reconnect_timeout)
        self.events.put_nowait(message(player, "system", {"type": "reconnect", "disconnect_id": disconnect_id}))

    async def __recv_task(self, player):
        process = self.processes[player]
        say_re = re.compile(r"say: (.*): (.*)")
        entered_re = re.compile(r'broadcast: print "(.*) entered the game.\\n"')
        disconnected_re = re.compile(r'broadcast: print "(.*) disconnected\\n"')
        finished_re = re.compile(r'ClientTimerStop: \d+ (\d+) "[^"]*" "([^"]*)".*')
        while self.stage != "shutdown":
            msg = (await process.recv()).decode('ascii')
            if msg is None or len(msg) == 0: break
            # print(f">: {msg.strip()}")
            if msg.startswith("say: "):
                say = say_re.match(msg)
                if say:
                    p = self.__remove_colors(say.group(1))
                    self.events.put_nowait(message(player, "say", {"player": p, "message": say.group(2)}))
            elif msg.startswith("broadcast"):
                enter = entered_re.match(msg)
                if enter:
                    p = self.__remove_colors(enter.group(1))
                    self.events.put_nowait(message(player, "join", {"player": p, "event": "join"}))
                disconnect = disconnected_re.match(msg)
                if disconnect:
                    p = self.__remove_colors(disconnect.group(1))
                    self.events.put_nowait(message(player, "join", {"player": p, "event": "disconnect"}))
            else:
                finish = finished_re.match(msg)
                if finish:
                    p = self.__remove_colors(finish.group(2))
                    self.events.put_nowait(message(player, "finish", {"player": p, "time": int(finish.group(1))}))
        print("__recv_task dead")
            
    async def get_ref(self, mapname):
        async with aiohttp.ClientSession() as session:
            resp = await session.get(f"http://ws.q3df.org/map/{mapname}")
            if resp.status >= 300:
                sys.stderr.write(f"get_ref({mapname}) [{resp.status}]\n")
                sys.stderr.flush()
                return None
            html = await resp.text()
            xtree = htmlparser.fromstring(html)
            refs = xtree.xpath("//a[contains(@href, '/maps/downloads')]")
            if len(refs) < 1:
                sys.stderr.write(f"get_ref({mapname}) no <a href='/maps/downloads/...'>\n")
                sys.stderr.flush()
                return None
            return refs[0].attrib.get('href')

    async def download(self, mapname, url, chunksize=8 * 1024 * 1024):
        async with aiohttp.ClientSession() as session:
            resp = await session.get("http://ws.q3df.org" + url, ssl=False)
            if resp.status >= 300:
                return f"Failed to download map {mapname}: {resp.status}"
            filename = os.path.join(self.quakepath, 'defrag', url.split('/')[-1])
            with open(filename, 'wb') as f:
                while True:
                    b = await resp.content.read(chunksize)
                    if len(b) <= 0: break
                    f.write(b)
                await asyncio.sleep(3.0)
            try:
                with zipfile.ZipFile(filename) as f:
                    if all((f'maps/{mapname}.bsp' != x.filename for x in f.filelist)):
                        return f"pk3 doesn't have desired map"
            except:
                return f"Invalid pk3"
            return None


async def report(pn):
    print(json.dumps(pn))

async def reset():
    print("round was reset")

def is_number(value):
    if isinstance(value, int): return True
    if isinstance(value, float): return True
    try:
        v = float(value)
        return True
    except:
        return False

class HttpScheduler:
    def __init__(self, ports, game, custom_config):
        self.ports = ports
        self.free_ports = set()
        self._app = None
        self._running_tasks = {}
        self._ports_lock = asyncio.Lock()
        self.game = game
        # self.runner = runner
        self.custom_config = custom_config
        self.running_tasks = {}
        self.default_report_host = os.environ.get("REPORT_HOST")
        self._free_lock = asyncio.Lock()
        if self.default_report_host is not None:
            print(f"Configured callback on host: '{self.default_report_host}'")

    async def start_game(self, started: asyncio.Future, token, competitionId, roundId, rules, players, report_callback, reset_callback, custom_config=[]):
    # r = rules(["cruton", "cruton2", "cruton3"], warmup_time=600)
        try:
            try:
                async with self._free_lock:
                    if token not in self.running_tasks:
                        self.running_tasks[token] = {}
                    key = f'{competitionId}/{roundId}'
                    if key in self.running_tasks[token]:
                        self.running_tasks[token][key].terminate()
                        del self.running_tasks[token][key]
                race = race_game(self.game, rules, players, report_callback, reset_callback)
                started.set_result(await race.prepare(custom_config))
                async with self._free_lock:
                    self.running_tasks[token][key] = race
            except Exception as e:
                started.set_exception(e)
                return
            if await race.run():
                async with self._free_lock:
                    if (token in self.running_tasks and
                        key in self.running_tasks[token] and
                        self.running_tasks[token][key] is race):
                        del self.running_tasks[token][key]
        finally:
            print(f"Returning ports!")
            async with self._ports_lock:
                for _, port in players:
                    print(f"add port {port}")
                    self.free_ports.add(port)

    async def terminate_game(self, token, competitionId, roundId):
        async with self._free_lock:
            if token not in self.running_tasks:
                return
            key = f'{competitionId}/{roundId}'
            if key in self.running_tasks[token]:
                self.running_tasks[token][key].terminate(True)
                del self.running_tasks[token][key]

    async def get_stage(self, competitionId, roundId):
        async with self._free_lock:
            key = f'{competitionId}/{roundId}'
            rnd = None
            for k, v in self.running_tasks.items():
                if key in v:
                    rnd = v[key]
            if rnd is None:
                return None
            return rnd.get_current_stage()

    def start(self, port):
        self._app = web.Application()
        for i in self.ports:
            self.free_ports.add(i)
        # {
        #   "token": string,
        #   "report_host": string,
        #   "report_path": string,
        #   "reset_path": string,
        #   "competitionId": string,
        #   "roundId": int,
        #   "players": string[],
        #   "maps": string[],
        #   "warmup_map": string,
        #   "warmup_time": float,
        #   "max_disconnects": int,
        #   "reconnect_timeout": float,
        #   "afterlevel_time": float,
        #   "aftermatch_time": float,
        #   "beforestart_gap": float,
        #   "custom_config": string[],
        # }
        self._app.add_routes([web.get('/version', lambda rq: self.request_version(rq))])
        self._app.add_routes([web.post('/round/start', lambda rq: self.request_game(rq))])
        self._app.add_routes([web.post('/round/terminate', lambda rq: self.request_terminate(rq))])
        self._app.add_routes([web.post('/round/stage', lambda rq: self.request_stage(rq))])
        web.run_app(self._app, port=port)

    async def request_version(self, _request: web.Request):
        return web.Response(
            status=200,
            content_type="application/json",
            body=RACE_SERVER_VERSION_INFO,
        )

    async def request_stage(self, request: web.Request):
        d = await request.json()
        competitionId = d.get("competitionId", None)
        roundId = d.get("roundId", None)
        if roundId is None or competitionId is None: return web.Response(status=400)
        result = await self.get_stage(competitionId, roundId)
        if result is None: return web.Response(status=404)
        return web.Response(
            status=200,
            content_type="application/json",
            body=json.dumps(result),
        )

    async def request_terminate(self, request: web.Request):
        d = await request.json()
        token = d.get("token", "")
        competitionId = d.get("competitionId", "")
        roundId = d.get("roundId", 0)
        await self.terminate_game(token, competitionId, roundId)
        return web.Response(status=200)

    async def request_game(self, request: web.Request):
        d = await request.json()
        # print(f"StartRequest: {json.dumps(d)}")
        token = d.get("token", "")
        competitionId = d.get("competitionId", "")
        roundId = d.get("roundId", 0)
        report_host = d.get("report_host", self.default_report_host)
        report_path = d.get("report_path", None)
        reset_path = d.get("reset_path", None)
        players = d["players"]
        maps = [map_info.from_dict(x) for x in d["maps"]]
        warmup_map = d.get("warmup_map", None)
        warmup_time = d.get("warmup_time", None)
        max_disconnects = d.get("max_disconnects", None)
        reconnect_timeout = d.get("reconnect_timeout", None)
        afterlevel_time = d.get("afterlevel_time", None)
        aftermatch_time = d.get("aftermatch_time", None)
        beforestart_gap = d.get("beforestart_gap", None)
        custom_config = [*self.custom_config, *d.get("custom_config", [])]
        print(f"Maps to run: {maps}")
        bads = []
        if any((x is None for x in maps)): bads.append("'maps' format is inappropriate, expected: (string | {name: string, config?: string[], estTime?: number})[]")
        if warmup_map is not None and not isinstance(warmup_map, str): bads.append("'warmup_map' must be string")
        if max_disconnects is not None and not isinstance(max_disconnects, int) and max_disconnects < 0: bads.append("'max_disconnects' must be non negative int")
        if reconnect_timeout is not None and not is_number(reconnect_timeout) and reconnect_timeout < 0: bads.append("'reconnect_timeout' must be non negative float")
        if warmup_time is not None and not is_number(warmup_time) and warmup_time < 0: bads.append("'warmup_time' must be non negative number")
        if afterlevel_time is not None and not is_number(afterlevel_time) and afterlevel_time < 0: bads.append("'afterlevel_time' must be non negative number")
        if aftermatch_time is not None and not is_number(aftermatch_time) and aftermatch_time < 0: bads.append("'aftermatch_time' must be non negative number")
        if beforestart_gap is not None and not is_number(beforestart_gap) and beforestart_gap < 0: bads.append("'beforestart_gap' must be non negative number")
        if len(bads) > 0:
            return web.Response(
                status=400,
                content_type="application/json",
                body=json.dumps({"err": {"code": "BadRequest", "message": "Invalid rules:\n" + '\n'.join(bads)}})
            )
        async with self._ports_lock:
            if len(players) > len(self.free_ports):
                return web.Response(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"err": {"code": "TemporarilyUnavailable", "message": "Not enough free ports, try again later"}})
                )
            pp = [(p, self.free_ports.pop()) for p in players]
        r = rules(maps)
        if warmup_map is not None: r.warmup_map = warmup_map
        if warmup_time is not None: r.warmup_time = warmup_time
        if max_disconnects is not None: r.max_disconnects = max_disconnects
        if reconnect_timeout is not None: r.reconnect_timeout = reconnect_timeout
        if afterlevel_time is not None: r.afterlevel_time = afterlevel_time
        if aftermatch_time is not None: r.aftermatch_time = aftermatch_time
        if beforestart_gap is not None: r.beforestart_gap = beforestart_gap

        res = asyncio.Future()
        report_f = report
        reset_f = reset
        if report_host is not None:
            if report_path is not None:
                report_f = self.create_report_hook(f"{report_host}{report_path}", token, pp)
            if reset_path is not None:
                reset_f = self.create_cancel_hook(f"{report_host}{reset_path}", token)
        asyncio.create_task(self.start_game(res, token, competitionId, roundId, r, pp, report_f, reset_f, custom_config))
        result = await res
        if "err" in result:
            return web.Response(
                status=400,
                content_type="application/json",
                body=json.dumps(result),
            )
        return web.Response(
            status=200,
            content_type="application/json",
            body=json.dumps(result),
        )

    def create_report_hook(self, url, token, players):
        async def report(result):
            # print(token, result, players)
            # {"players": string[], "times": (string, float, float, bool, dict)[]}
            try:
                ind = result["players"].index(result["times"][0][0])
                async with aiohttp.ClientSession() as session:
                    if token:
                        session.headers.add("Cookie", f"token={token}")
                    resp = await session.post(url, json={"winner": ind, "table": result["times"]})
                    if resp.ok:
                        return
                    print(f"Error: unable to report results: winner is {ind}")
            except Exception as e:
                print(e)
        return report
    def create_cancel_hook(self, url, token):
        async def report():
            try:
                async with aiohttp.ClientSession() as session:
                    if token:
                        session.headers.add("Cookie", f"token={token}")
                    resp = await session.post(url)
                    if resp.ok:
                        return
                    print(f"Error: unable to report failed round {await resp.text()}")
            except Exception as e:
                print(e)
        return report

if __name__ == "__main__":
    # required environments:
    # REPORT_HOST - host where to report race results (e.g. https://dfcomps.ru/race)
    # GAME_PATH - folder with defrag and ioq3ded (e.g. "/home/rantrave/games/defrag")
    custom_config = ["exec server.cfg"]
    game = os.getenv("GAME_PATH")
    if game is None or not os.path.isdir(game) or not os.path.isfile(os.path.join(game, GAME)) or not os.path.isdir(os.path.join(game, "defrag")):
        print(f"game at {game} is configured improperly")
        exit(1)
    scheduler = HttpScheduler([27968, 27969, 27970, 27971, 27972], os.environ.get("GAME_PATH"), custom_config)
    scheduler.start(9682)