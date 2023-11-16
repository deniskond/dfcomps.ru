import json
import aiohttp
import asyncio
import lxml.html.soupparser as htmlparser
import os
import random
import subprocess
import sys
import threading
import time
import queue
import re
# import websockets
import zipfile
from aiohttp import web

from typing import Dict


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
        cl = [self.binary,  *(x for v in config for x in ('+' + v.strip()).split(' '))]
        print(cl)
        return cl

class rules:
    def __init__(self, maps=[], warmup_map="tr1ckhouse-beta3", warmup_time=120, max_disconnects=3, afterlevel_time=0.5, aftermatch_time=120):
        self.warmup_map = warmup_map
        self.warmup_time = warmup_time
        self.max_disconnects = max_disconnects
        self.afterlevel_time = afterlevel_time
        self.aftermatch_time = aftermatch_time
        self.maps = maps

class message:
    def __init__(self, player, msgtype, content):
        self.time = time.time()
        self.player = player
        self.type = msgtype
        self.content = content

class race_game:
    def __init__(self, quakepath, rules, player_ports, report_hook):
        self.__color_re = re.compile(r'\^.')
        self.quakepath = quakepath
        self.rules = rules
        self.maplist = rules.maps
        self.players = player_ports #set([self.__remove_colors(p) for p in players])
        self.events = asyncio.Queue()
        self.report_hook = report_hook
        self.gamestate = {
            player: {
                "times": [{"map": m, "start": None, "end": None, "demo": None} for m in self.maplist],
                "ready": False,
                "finished": False,
                "disqualified": False,
                "connected": False,
                "disconnects": 0,
                "current_map": -1,
            }
            for player in self.players
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

    async def prepare(self):
        binpath = os.path.join(self.quakepath, "ioq3ded")
        modpath = os.path.join(self.quakepath, "defrag")
        if not os.path.exists(binpath):
            return {"error": {"code": "BadConfig", "message": f"ioquake3 dedicated server is not found at '{binpath}'"} }
        if not os.path.exists(modpath):
            return {"error": {"code": "BadConfig", "message": f"Defrag is not found at '{modpath}'"} }
        # ensure maplist is fully presented
        listmaps = []
        for i in os.listdir(modpath):
            if i.endswith('.pk3'):
                with zipfile.ZipFile(os.path.join(modpath, i)) as f:
                    listmaps += [os.path.basename(x.filename[:-4]).lower() for x in f.filelist if x.filename.endswith('.bsp')]
        print(listmaps)
        reqmaps = self.maplist + [self.rules.warmup_map]
        todownload = [x for x in reqmaps if x.lower() not in listmaps]
        urls = list(uniq(zip(todownload, await asyncio.gather(*[self.get_ref(x) for x in todownload])), key=lambda x: x[1]))
        print(urls)
        errors = [y for y in await asyncio.gather(*[self.download(x[0], x[1]) for x in urls]) if y is not None]
        if len(errors) > 0:
            return {"error": {"code": "InternalError", "message": f"Failed to download maps:\n" + '\n'.join(errors)} }
        print(self.players)
        qf = quake_factory(binpath, [
            "set fs_game defrag",
            "set df_promode 1",
            f"map {self.rules.warmup_map}",
            # [FIXME] add required config!
        ])
        await asyncio.sleep(1.0)
        for player, port in self.players.items():
            self.processes[player] = qf.run([f"set net_port {port}"])
            print(f"Player '{player}' is running on port {port}")
        
        await asyncio.sleep(1.0)

        await self.broadcast(f"map {self.rules.warmup_map}")
        
        return {"result": list(self.players.items())}

    async def run(self):
        await asyncio.gather(*[self.__main_task(), self.__alive(), self.__countdown_task(), self.__all_recv_task(), self.__waitforplayers_task()])

    async def broadcast(self, message: str, exclude=[]):
        await asyncio.gather(*[x.send(message.encode('ascii')) for k,x in self.processes.items() if not x.is_closed() and k not in exclude])

    async def send(self, player, message):
        await self.processes[player].send(message.encode('ascii'))

    def __remove_colors(self, string):
        return self.__color_re.sub("", string).lower()

    async def __alive(self):
        while self.stage != "shutdown":
            # print('tick')
            await self.broadcast("")
            await asyncio.sleep(1.0)

    async def __all_recv_task(self):
        await asyncio.gather(*[self.__recv_task(x) for x in self.processes])

    async def __main_task(self):
        try:
            while self.stage != "shutdown":
                msg: message = await self.events.get()
                print(f'message [{msg.player}]: {msg.content}')
                player = msg.player
                if msg.type == "say":
                    gs = self.gamestate[msg.player]
                    cmdplayer = msg.content["player"]
                    msgtext = msg.content["message"]
                    if msgtext.startswith('!'):
                        if msg.player == cmdplayer:
                            if msgtext == "!giveup":
                                gs["finished"] = True
                                gs["disqualified"] = True
                                await self.broadcast(f"say ^3Player ^7{player} ^3gave up!")
                            elif self.stage == "warmup":
                                if msgtext == "!ready":
                                    gs["ready"] = True
                                    # check for all ready
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
                    if player == cmdplayer:
                        cmap = gs["current_map"]
                        if cmap >= 0 and self.stage == "race": # race is going on
                            if event == "join":
                                print(f"Player {player} joined {cmap}!")
                                if not gs["connected"]:
                                    gs["connected"] = True
                                # [TODO] stop ongoing reconnect timer
                                curmap = gs["times"][cmap]
                                if curmap["start"] is None:
                                    curmap["start"] = msg.time
                            elif event == "disconnect":
                                # [TODO] start reconnect timer
                                gs["disconnects"] += 1
                                if gs["disconnects"] > self.rules.max_disconnects:
                                    gs["disqualified"] = True
                                if gs["connected"]:
                                    gs["connected"] = False
                                curmap = gs["times"][cmap]
                                if curmap["start"] is not None:
                                    curmap["start"] = None
                                # restart map and wait for next connection
                                await self.send(player, f"map {self.maplist[cmap]}")
                elif msg.type == "finish":
                    gs = self.gamestate[msg.player]
                    cmdplayer = msg.content["player"]
                    demotime = msg.content["time"]
                    if player == cmdplayer:
                        cmap = gs["current_map"]
                        curmap = gs["times"][cmap]
                        if curmap["start"] is not None:
                            curmap["end"] = msg.time
                            curmap["demo"] = demotime
                            # run next map
                            if cmap == len(self.maplist) - 1:
                                gs["finished"] = True
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
                            self.processes[p].shutdown()
                            del self.processes[p]
                        if len(self.processes) < 2:
                            # all players but at least one are done
                            break
                    elif mtype == "start":
                        for p, g in self.gamestate.items():
                            g["current_map"] = 0
                        m = self.maplist[0]
                        await self.broadcast(f"map {m}")
                        # await asyncio.gather(*[x.send(f"map {m}") for x in self.processes.values()])

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
                    sum_time += tms["end"] - tms["start"]
                    sum_demo += tms["demo"]
                if dis:
                    playertimes.append((p, None, None, False, t))
                else:
                    playertimes.append((p, sum_time, sum_demo, not g["disqualified"], t))
            
            playertimes.sort(key=lambda x: (1e100, 1e100) if x[1] is None else (x[1], x[2]))
            await self.report_hook(self.gamestate)

            print(self.players)
            print(playertimes)
            maxlen = max([len(p) for p in self.players])
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

            await asyncio.sleep(60.0)
            for i in self.processes.values():
                i.shutdown()
            await asyncio.gather(*[x.wait_shutdown() for x in self.processes.values()])
        finally:
            self.stage = "shutdown"

    async def _go_to_next_map(self, player):
        gs = self.gamestate[player]
        cmap = gs["current_map"]
        cmap += 1
        if cmap < len(self.maplist):
            print(f"next map is {self.maplist[cmap]}")
            gs["current_map"] = cmap
            await self.send(player, f"say ^3Going to {self.maplist[cmap]}")
            await asyncio.sleep(self.rules.afterlevel_time)
            await self.send(player, f"map {self.maplist[cmap]}")
        else:
            print(f"round done!")
            await self.send(player, f"map {self.rules.warmup_map}")


    async def __countdown_task(self):
        while True:
            e = await self.countdown.get()
            if e is None:
                break
            await self.broadcast(e)
            self.countdown_stage += 1
            await asyncio.sleep(1.0)
        self.events.put_nowait(message(None, "system", {"type": "start"}))
        

    async def __waitforplayers_task(self):
        await asyncio.sleep(self.rules.warmup_time) # wait two minutes to connect players
        self.events.put_nowait(message(None, "system", {"type": "wait_end"}))


    async def __recv_task(self, player):
        process = self.processes[player]
        say_re = re.compile(r"say: (.*): (.*)")
        entered_re = re.compile(r'broadcast: print "(.*) entered the game.\\n"')
        disconnected_re = re.compile(r'broadcast: print "(.*) disconnected\\n"')
        finished_re = re.compile(r'ClientTimerStop: \d+ (\d+) "[^"]*" "([^"]*)".*')
        while True:
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
            try:
                with zipfile.ZipFile(filename) as f:
                    if all((f'maps/{mapname}.bsp' != x.filename for x in f.filelist)):
                        return f"pk3 doesn't have desired map"
            except:
                return f"Invalid pk3"
            return None


async def report(pn):
    print(json.dumps(pn))

async def race_run(race: race_game):
    await race.prepare()
    await race.run()

def is_number(value):
    if isinstance(value, int): return True
    if isinstance(value, float): return True
    try:
        v = float(value)
        return True
    except:
        return False

async def start_game_mock(started: asyncio.Future, rules, players, callback):
    await asyncio.sleep(2.0)
    started.set_result({"result": "huraaay!"})
    await asyncio.sleep(10.0)
    callback({"result": "SHEESH!"})

async def start_game(started: asyncio.Future, rules, players, callback):
    # r = rules(["cruton", "cruton2", "cruton3"], warmup_time=600)
    try:
        race = race_game("/home/rantrave/games/defrag", rules, players, callback)
        started.set_result(await race.prepare())
    except Exception as e:
        started.set_exception(e)
        return

    await race.run()

class HttpScheduler:
    def __init__(self, ports, runner):
        self.ports = ports
        self.free_ports = set()
        self._app = None
        self._running_tasks = {}
        self._ports_lock = asyncio.Lock()
        self.runner = runner

    def start(self, port):
        self._app = web.Application()
        for i in self.ports:
            self.free_ports.add(i)
        self._app.add_routes([web.post('/round/start', lambda rq: self.request_game(rq))])
        web.run_app(self._app, port=port)

    async def request_game(self, request: web.Request):
        d = await request.json()
        token = d.get("token", None)
        players = d["players"]
        maps = d["maps"]
        warmup_map = d.get("warmup_map", None)
        warmup_time = d.get("warmup_time", None)
        max_disconnects = d.get("max_disconnects", None)
        afterlevel_time = d.get("afterlevel_time", None)
        aftermatch_time = d.get("aftermatch_time", None)
        bads = []
        if warmup_map is not None and not isinstance(warmup_map, str): bads.append("'warmup_map' must be string")
        if max_disconnects is not None and not isinstance(max_disconnects, int) and max_disconnects < 0: bads.append("'max_disconnects' must be non negative int")
        if warmup_time is not None and not is_number(warmup_time) and warmup_time < 0: bads.append("'warmup_time' must be non negative number")
        if afterlevel_time is not None and not is_number(afterlevel_time) and afterlevel_time < 0: bads.append("'afterlevel_time' must be non negative number")
        if aftermatch_time is not None and not is_number(aftermatch_time) and aftermatch_time < 0: bads.append("'aftermatch_time' must be non negative number")
        if len(bads) > 0:
            return web.Response(
                status=400,
                content_type="application/json",
                body=json.dumps({"error": {"code": "BadRequest", "message": "Invalid rules:\n" + '\n'.join(bads)}})
            )
        async with self._ports_lock:
            if len(players) > len(self.free_ports):
                return web.Response(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"error": {"code": "TemporarilyUnavailable", "message": "Not enough free ports, try again later"}})
                )
            pp = {p: self.free_ports.pop() for p in players}
        r = rules(maps)
        if warmup_map is not None: r.warmup_map = warmup_map
        if warmup_time is not None: r.warmup_time = warmup_time
        if max_disconnects is not None: r.max_disconnects = max_disconnects
        if afterlevel_time is not None: r.afterlevel_time = afterlevel_time
        if aftermatch_time is not None: r.aftermatch_time = aftermatch_time

        res = asyncio.Future()
        asyncio.create_task(self.runner(res, r, pp, self.create_report_hook(token, pp)))
        result = await res
        if "error" in result:
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

    def create_report_hook(self, token, players):
        async def report(result):
            print(token, result, players)
            async with self._ports_lock:
                for port in players.values():
                    self.free_ports.add(port)
        return report

if __name__ == "__main__":
    r = rules(["cruton", "cruton2", "cruton3"], warmup_time=600)
    ps = {"rantrave":27970, "vor": 27968}
    ps = {"rantrave":27968, "w00dy.th":27970}
    race = race_game("/home/rantrave/games/defrag", r, ps, report)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(race_run(race))
    
    # scheduler = HttpScheduler([27968, 27970], start_game)
    # scheduler.start(8080)