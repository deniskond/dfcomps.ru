import axios from 'axios';
import { Subject, Subscription } from 'rxjs';
import { v4 } from 'uuid';
import {
  AsyncResult,
  Result,
  badRequest,
  duplicate,
  error,
  isResult,
  notAllowed,
  notFound,
  result,
} from './types/result';
import {
  CompetitionRules,
  CompetitionView,
  Round,
  RoundView,
  MapInfo,
  PlayerInfo,
  CompetitionCreateInfo,
  RawCompetitionView,
  IncompleteMapInfo,
  CustomizableConfig,
  RoundProgressView,
  isArray,
  isInteger,
} from './interfaces/views.interface';
import { CompetitionData, RoundData, RoundProgress, UpdateMessage } from './interfaces/data.interface';
import { createHash } from 'crypto';

/* scenario:
  - createCompetition
  - add players & maps
  - competitionStart
    - createRound
    - give tokens to players & sibscribeRound
    - roundBan by players
    - (admin can fix errors if nesessary)
    - roundSet("Start")
    - roundSet(winner: 0 | 1)
  [use getBracket to update brackets]
*/

export class RaceController {
  private competitions: { [key: string]: CompetitionData } = {};
  serverHostAddress?: string;
  serverHostPort?: number;

  public constructor(serverHostAddress: string | undefined, serverHostPort: number | undefined) {
    this.serverHostAddress = serverHostAddress;
    this.serverHostPort = serverHostPort;
  }

  public async createCompetition(
    info: CompetitionCreateInfo,
    token: string | undefined,
  ): Promise<Result<CompetitionView>> {
    if (token === undefined) {
      return notAllowed('You must be logged in to create competitions');
    }
    if (info.rules.raceServerHost !== undefined) {
      if (!(await this.validateRaceHost(info.rules.raceServerHost))) {
        return badRequest(
          `Host at '${info.rules.raceServerHost}' doesn't match required minimal version of RaceAPI 1.0.0`,
        );
      }
    }
    const res = { id: v4(), mapPool: [], players: [], ...info };
    this.competitions[res.id] = {
      view: res,
      adminToken: token,
      rounds: {},
      stream: new Subject<UpdateMessage>(),
    };
    return result(res);
  }

  public async makeCompetition(
    competition: RawCompetitionView,
    token: string | undefined,
  ): Promise<Result<CompetitionView>> {
    if (token === undefined) {
      return notAllowed('You must be logged in to make competitions');
    }
    const infos = await Promise.all(competition.mapPool.map((x) => this.ensureMapInfo(x)));
    const notFound = infos
      .map((x, i) => [x, competition.mapPool[i].mapName])
      .filter((x) => x[0] === undefined)
      .map((x) => x[1]);
    if (notFound.length > 0) {
      return badRequest(`Some maps are not found: ${notFound}`);
    } else {
      // typecheck failed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      competition.mapPool = infos as any;
    }
    const res = { id: v4(), ...competition };
    const err = await this.isValidCompetition(res);
    if (err !== null) {
      return badRequest(err);
    }
    this.competitions[res.id] = {
      view: res,
      adminToken: token,
      rounds: {},
      stream: new Subject<UpdateMessage>(),
    };
    return result(res);
  }

  private async isValidCompetition(x: CompetitionView) {
    if (x.players.length < 2) return 'Expected at least 2 players';
    const nrounds = Math.pow(2, Math.ceil(Math.log2(x.players.length))) - 1;
    if (x.mapPool.length === 0) return 'Expected at least one map in pool';
    if (x.rules.forbidBans) {
      if (x.rules.numBans > x.mapPool.length / 6) return 'Not enough maps in pool';
    } else {
      if (x.rules.numBans > x.mapPool.length / 2) return 'Not enough maps in pool';
    }
    if (x.rules.raceServerHost !== undefined) {
      if (!(await this.validateRaceHost(x.rules.raceServerHost))) {
        return `Host at '${x.rules.raceServerHost}' doesn't match required minimal version of RaceAPI 1.0.0`;
      }
    }
    if (x.brackets !== undefined) {
      if (x.brackets.rounds.length !== nrounds)
        return `Invalid rounds count, expected ${nrounds} got ${x.brackets.rounds.length}`;
      for (const i in x.brackets.rounds) {
        const ind = parseInt(i);
        const round = x.brackets.rounds[i];
        if (round.bannedMaps !== undefined) {
          for (const ban of round.bannedMaps) {
            if (ban >= x.mapPool.length) return `Invalid ban at round ${i}.`;
          }
        }
        if (round.winnerIndex !== undefined) {
          if (round.winnerIndex >= round.players.length) return `Invalid winner at round ${i}`;
          if (ind > 0) {
            const rnd = Math.floor((ind + 1) / 2) - 1;
            const pos = (ind + 1) % 2;
            if (round.players[round.winnerIndex] !== x.brackets.rounds[rnd].players[pos]) {
              return `Wrong winner of round ${rnd}[${pos}]. Due to results of ${rnd} it must be ${
                round.players[round.winnerIndex]
              }`;
            }
          }
        }
        for (const pl of round.players) {
          if (pl !== null && pl >= x.players.length) return `Out of range player at round ${i}`;
        }
      }
    }
    return null;
  }

  private defaultedConfig(
    x?: Partial<CustomizableConfig>,
    base_config?: CustomizableConfig,
  ): Partial<CustomizableConfig> {
    if (x === undefined) return {};
    const result: Partial<CustomizableConfig> = { ...x };
    if (result.obsEnabled === undefined) result.obsEnabled = base_config?.obsEnabled;
    if (result.promode === undefined) result.promode = base_config?.promode;
    return result;
  }

  private async ensureMapInfo(x: IncompleteMapInfo): Promise<MapInfo | undefined> {
    const ls = x.levelShotUrl;
    const url = x.worldspawnUrl;
    if (ls !== undefined && url !== undefined) {
      return {
        mapName: x.mapName,
        levelShotUrl: ls,
        worldspawnUrl: url,
        config: this.defaultedConfig(x.config),
        estTime: x.estTime === undefined ? -1 : x.estTime,
        stats: x.stats,
      };
    }
    const info = await this.getMapInfo(x.mapName);
    if (info === undefined) {
      return undefined;
    }
    return { ...info, config: this.defaultedConfig(x.config), estTime: x.estTime === undefined ? -1 : x.estTime };
  }

  public getCompetition(
    competitionId: string,
    token: string | undefined,
  ): Result<CompetitionView & { owned: boolean }> {
    const { err, result: competition } = this.validateCompetition(competitionId, undefined, false);
    if (err !== undefined) return error(err);
    return result({ ...competition.view, owned: competition.adminToken === token });
  }
  public removeCompetition(competitionId: string, token: string | undefined): Result<boolean> {
    const { err, result: competition } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    competition.stream.complete();
    return result(delete this.competitions[competitionId]);
  }
  public listCompetitions(token: string | undefined): Result<{ id: string; name: string }[]> {
    let res;
    if (token !== undefined) {
      res = Object.keys(this.competitions)
        .filter((x) => this.competitions[x].adminToken === token)
        .map((x) => ({ id: x, name: this.competitions[x].view.name }));
    } else {
      res = Object.keys(this.competitions).map((x) => ({ id: x, name: this.competitions[x].view.name }));
    }
    return result(res);
  }
  public async competitionUpdateRules(
    competitionId: string,
    token: string | undefined,
    rules: CompetitionRules,
  ): Promise<Result<CompetitionView>> {
    const { err, result: competition } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    if (rules.raceServerHost !== undefined) {
      if (!(await this.validateRaceHost(rules.raceServerHost))) {
        return badRequest(`Host at '${rules.raceServerHost}' doesn't match required minimal version of RaceAPI 1.0.0`);
      }
    }
    competition.view.rules = rules;
    return result(competition.view);
  }

  public async competitionAddMapIntoPool(
    competitionId: string,
    token: string | undefined,
    nameOrUrl: string,
  ): AsyncResult<number> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    let mapName = nameOrUrl;
    if (nameOrUrl.indexOf('ws.q3df.org') !== -1) {
      const mname = nameOrUrl.match(/\/map\/([^/]*)/)?.at(1);
      if (mname === undefined) return badRequest('Invalid url format');
      mapName = mname;
    }
    if (competition.mapPool.find((x) => x.mapName === mapName) !== undefined) {
      return duplicate(`Map ${mapName} is already added`);
    }
    const mapInfo = await this.getMapInfo(mapName);
    if (mapInfo === undefined) {
      return badRequest(`Map ${mapName} is not found`);
    }
    return result(competition.mapPool.push(mapInfo) - 1);
  }
  public updateMapConfig(
    competitionId: string,
    token: string | undefined,
    mapName: string,
    config: Partial<CustomizableConfig>,
  ): Result<boolean> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    const index = competition.mapPool.findIndex((x) => x.mapName === mapName);
    if (index === -1) return result(false);
    competition.mapPool[index].config = {
      ...competition.mapPool[index].config,
      ...config,
    };
    return result(true);
  }
  public competitionRemoveMapFromPool(
    competitionId: string,
    token: string | undefined,
    mapName: string,
  ): Result<boolean> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    const index = competition.mapPool.findIndex((x) => x.mapName === mapName);
    if (index === -1) return result(false);
    competition.mapPool[index] = competition.mapPool[competition.mapPool.length - 1];
    competition.mapPool.pop();
    return result(true);
  }

  public async competitionAddPlayer(
    competitionId: string,
    token: string | undefined,
    playerName: string,
  ): AsyncResult<number> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);

    const competition = competitionData.view;
    if (competition.players.find((x) => x.playerName === playerName) !== undefined) {
      return duplicate(`Player ${playerName} is already added`);
    }
    const playerInfo = await this.getPlayerInfo(playerName);
    if (playerInfo === undefined) {
      return notFound(`Player ${playerName} is not found`);
    }
    return result(competition.players.push(playerInfo) - 1);
  }
  public competitionRemovePlayer(
    competitionId: string,
    token: string | undefined,
    playerName: string,
  ): Result<boolean> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    const index = competition.players.findIndex((x) => x.playerName === playerName);
    if (index === -1) return result(false);
    competition.players[index] = competition.players[competition.players.length - 1];
    competition.players.pop();
    return result(true);
  }

  public async competitionStart(competitionId: string, token: string | undefined): AsyncResult<number> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    if (competition.rules.forbidBans) {
      if (competition.rules.numBans > competition.mapPool.length / 6) {
        return badRequest(
          `Not enough maps in pool for ${competition.rules.numBans}. At least ${
            6 * competition.rules.numBans
          } expected`,
        );
      }
    } else {
      if (competition.rules.numBans > competition.mapPool.length / 2) {
        return badRequest(
          `Not enough maps in pool for ${competition.rules.numBans}. At least ${
            2 * competition.rules.numBans
          } expected`,
        );
      }
    }
    const playersShuffle = competition.players
      .map((x, i) => ({
        player: i,
        factor:
          parseInt(createHash('shake256').update(competition.players[i].playerName, 'utf-8').digest('hex')) % 100000007,
      }))
      .sort((a, b) => a.factor - b.factor)
      .map((x) => x.player);
    const circles: Round[][] = [];
    let n = Math.pow(2, Math.ceil(Math.log2(playersShuffle.length)));
    let circle: Round[] = [];
    const half = n >> 1;
    for (let i = 0; i < half; ++i) {
      const player0 = playersShuffle[i];
      const player1 = playersShuffle[half + i];
      circle.push({
        players: [player0, player1],
        winnerIndex: player1 === undefined ? 0 : undefined,
      });
    }
    circles.push(circle);
    n >>= 1;
    while (n > 1) {
      circle = [];
      for (let i = 0; i < n >> 1; ++i) {
        circle.push({
          players: [null, null],
        });
      }
      circles.push(circle);
      // n = Math.floor(n / 2);
      n >>= 1;
    }
    const rounds: Round[] = [];
    for (let i = circles.length; i-- > 0; ) {
      rounds.push(...circles[i]);
    }
    competition.brackets = { rounds };
    this.updateBracket(competition);

    return result(competition.brackets.rounds.length);
  }

  public createRound(competitionId: string, token: string | undefined, round: number): Result<UpdateMessage> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    if (competition.brackets === undefined) {
      return badRequest(`Competition with id='${competitionId}' is not started`);
    }
    if (round >= competition.brackets.rounds.length || round < 0) {
      return badRequest(`Round ${round} is not exist`);
    }
    if (competition.brackets.rounds[round].winnerIndex !== undefined) {
      return badRequest(`Round ${round} is completed`);
    }
    // const id = this.getRoundId(competitionId, round);
    let roundView = competitionData.rounds[round]?.view;
    if (roundView !== undefined) {
      return duplicate(`Round ${round} is already started`);
    }
    const p0 = competition.brackets.rounds[round].players[0];
    const p1 = competition.brackets.rounds[round].players[1];
    if (p0 === null || p1 === null) {
      return badRequest(`Players are not ready to round ${round}`);
    }
    const r0 = competition.brackets.rounds[(round << 1) + 1];
    const r1 = competition.brackets.rounds[(round << 1) + 2];
    const forbiddenBans = competition.rules.forbidBans ? [...(r0?.bannedMaps ?? []), ...(r1?.bannedMaps ?? [])] : [];
    const order = competition.mapPool
      .map((x, i) => ({
        map: i,
        factor: Math.random(),
      }))
      .sort((a, b) => a.factor - b.factor)
      .map((x) => x.map);
    roundView = {
      forbiddenBans,
      players: [
        {
          info: competition.players[p0],
        },
        {
          info: competition.players[p1],
        },
      ],
      order,
      bans: {},
      banTurn: 0,
      stage: 'Ban',
    };
    competitionData.rounds[round] = {
      view: roundView,
      players: roundView.players.map((x) => ({ userId: x.info.userId, token: v4() })),
      competitionId,
      round,
    };

    const adminData =
      competitionData.adminToken === token
        ? Object.fromEntries(Object.entries(competitionData.rounds).map((x) => [x[0], x[1].players]))
        : undefined;
    competitionData.stream.next({
      id: competitionId,
      roundUpdate: { [round]: roundView },
    });
    return result({
      id: competitionId,
      adminData,
      roundUpdate: { [round]: roundView },
    });
  }

  public async subscribe(
    competitionId: string,
    token: string | undefined,
    onUpdate: (x: UpdateMessage) => void,
  ): AsyncResult<Subscription> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, undefined, false);
    if (err !== undefined) return error(err);
    const userId = await this.getUserIdAuth(token);

    return result(
      competitionData.stream.subscribe((x) =>
        onUpdate({
          ...x,
          adminData:
            competitionData.adminToken === token
              ? Object.fromEntries(Object.entries(competitionData.rounds).map((x) => [x[0], x[1].players]))
              : undefined,
          currentRound: this.getCurrentRound(competitionData, userId, token),
        }),
      ),
    );
  }

  public getCurrentRound(competition: CompetitionData, userId: number | undefined, token: string | undefined) {
    let result: { roundId: number; index: number } | undefined = {
      roundId: -1,
      index: 0,
    };
    for (const [roundId, roundData] of Object.entries(competition.rounds)) {
      if (roundData.view.winner !== undefined) continue;
      const index = roundData.players.findIndex(
        (x) => (x.userId !== undefined && x.userId === userId) || x.token === token,
      );
      if (index !== -1) {
        result = {
          roundId: parseInt(roundId),
          index,
        };
        break;
      }
    }
    console.log('CURRENT:');
    console.log(result);
    return result;
  }

  public async getUpdate(competitionId: string, token?: string): AsyncResult<UpdateMessage> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, undefined, false);
    if (err !== undefined) return error(err);
    const userId = await this.getUserIdAuth(token);
    const currentRound = this.getCurrentRound(competitionData, userId, token);
    const adminData =
      competitionData.adminToken === token
        ? Object.fromEntries(Object.entries(competitionData.rounds).map((x) => [x[0], x[1].players]))
        : undefined;
    const msg: UpdateMessage = {
      id: competitionId,
      roundUpdate: Object.fromEntries(Object.entries(competitionData.rounds).map((x) => [x[0], x[1].view])),
      bracketUpdate: competitionData.view.brackets,
      currentRound,
      adminData,
    };
    competitionData.stream.next(msg);
    return result(msg);
  }

  private toProgressView(
    competition: CompetitionData,
    roundId: number,
    progress: Record<string, RoundProgress>,
  ): RoundProgressView {
    const view = competition.rounds[roundId].view;
    const banned = Object.keys(view.bans).map((x) => parseInt(x));
    return {
      roundId,
      maps: view.order.filter((x) => banned.every((y) => y !== x)).map((x) => competition.view.mapPool[x]),
      players: view.players.map((x) => x.info),
      progress,
    };
  }

  public async getRoundProgress(
    competitionId: string,
    roundId?: number,
  ): Promise<Result<RoundProgressView | { roundId: -1 }>> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, undefined, false);
    if (err !== undefined) return error(err);
    const curtime = new Date().getTime();
    let rId = roundId;
    if (roundId === undefined) {
      const rounds = Object.values(competitionData.rounds).filter((x) => x.view.stage === 'Running');
      if (rounds.length === 0) return result({ roundId: -1 });
      rId = rounds[0].round;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rndId: number = rId!;
    if (competitionData.rounds[rndId]?.view.stage !== 'Running') return result({ roundId: -1 });
    if (
      competitionData.lastProgressRequest !== undefined &&
      rndId === competitionData.lastProgressRequest.roundId &&
      curtime - competitionData.lastProgressRequest.time < 1000
    ) {
      return result(this.toProgressView(competitionData, rndId, competitionData.lastProgressRequest.progress));
    }
    competitionData.lastProgressRequest = {
      time: curtime,
      roundId: rndId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      progress: undefined!,
    };

    const p = this.getRaceHost(competitionId);
    if (p === undefined) return error({ code: 'NotAllowed', message: 'Server is not running' });
    const url = `${p}/round/stage`;
    try {
      const serverHostRequest = await axios.post(url, {
        competitionId,
        roundId: rndId,
      });
      if (serverHostRequest.status >= 300) {
        console.warn(`ServerHost[${serverHostRequest.status}]`);
        return error({
          code: 'InternalError',
          message: `Connection failed with status code ${serverHostRequest.status}`,
        });
      }
      competitionData.lastProgressRequest.progress = serverHostRequest.data;
      return result(this.toProgressView(competitionData, rndId, competitionData.lastProgressRequest.progress));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response) {
        console.warn(`ServerHost[${e.response.status}]: ${JSON.stringify(e.response.data)}`);
        return error({ code: 'InternalError', message: `Connection failed with status code ${e.response.status}` });
      } else if (e.request) {
        return error({ code: 'InternalError', message: `Empty response` });
      } else {
        return error({ code: 'InternalError', message: e.message });
      }
    }
  }

  public async roundBan(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    mapIndex: number,
  ): AsyncResult<RoundView> {
    const v = await this.validateBanRound(competitionId, roundId, token, false, true);
    if (v.err !== undefined) return v;
    const { round, competition } = v.result;
    const currentPlayer = round.players[round.view.banTurn];
    if (currentPlayer.token === token) {
      // count this player bans
      const numBans = Object.values(round.view.bans).filter((x) => x === round.view.banTurn).length;
      if (competition.rules.numBans <= numBans) {
        return badRequest('No more bans allowed by the rules');
      }
      // only admin can force ban of forbidden maps
      if (round.view.forbiddenBans.find((x) => x === mapIndex) !== undefined) {
        return badRequest('Map ban is not allowed by the rules');
      }
    }
    // player bans or admin forces ban
    console.log(`player ${token} banning: ${mapIndex}`);
    if (round.view.bans[mapIndex] === undefined) {
      // if wasn't banned before -- update & turn to next player
      console.log(`player ${token} banned: ${mapIndex}`);
      round.view.bans[mapIndex] = round.view.banTurn;
      round.view.banTurn = (round.view.banTurn + 1) % round.view.players.length;
      this.notifyRoundUpdate(round);
    }
    return result(round.view);
  }
  // only for admin
  public async roundUnban(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    mapIndex: number,
  ): AsyncResult<RoundView> {
    const v = await this.validateBanRound(competitionId, roundId, token, true, true);
    if (v.err !== undefined) return v;
    const { round } = v.result;
    // admin forces unban
    if (delete round.view.bans[mapIndex]) {
      // if succeed
      round.view.banTurn = (round.view.banTurn + round.view.players.length - 1) % round.view.players.length;
    }
    this.notifyRoundUpdate(round);
    return result(round.view);
  }

  private toConfigStrings(cfg?: Partial<CustomizableConfig>, always_define = false): string[] {
    const result = [];
    let killobs = undefined;
    let promode = undefined;
    if (always_define || cfg?.obsEnabled !== undefined) killobs = cfg?.obsEnabled ?? false ? '0' : '1';
    if (always_define || cfg?.promode !== undefined) promode = cfg?.promode ?? true ? '1' : '0';
    if (killobs !== undefined) result.push(`df_ob_killobs ${killobs}`);
    if (promode !== undefined) result.push(`df_promode ${promode}`);
    return result;
  }

  public async roundSet(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    stateOrWinner: 'Restart' | 'Reset' | 'Start' | number,
  ): AsyncResult<RoundView> {
    const v = await this.validateBanRound(competitionId, roundId, token, true, false);
    if (v.err !== undefined) return v;
    const { round, competition } = v.result;
    if (stateOrWinner === 'Reset') {
      round.view.stage = 'Ban';
      round.view.bans = {};
      round.view.winner = undefined;
      await this.terminateServer(competitionId, roundId, token);
    } else if (stateOrWinner === 'Restart') {
      round.view.stage = 'Ban';
      round.view.winner = undefined;
    } else if (stateOrWinner === 'Start') {
      const bans = Object.values(round.view.bans).reduce(
        (s, x) => {
          s[x] += 1;
          return s;
        },
        round.view.players.map(() => 0),
      );
      if (bans.some((x) => x < competition.rules.numBans)) {
        console.log(`TOTAL BANS: ${bans}`);
        return badRequest('Bans are not complete');
      }
      if (competition.brackets === undefined) {
        return badRequest('Brackets are dead');
      }

      const banned = Object.keys(round.view.bans).map((x) => parseInt(x));
      const maps: { mapName: string; config?: string[]; estTime?: number }[] = round.view.order
        .filter((x) => banned.every((y) => y !== x))
        .map((x) => ({
          ...competition.mapPool[x],
          config: this.toConfigStrings(competition.mapPool[x].config),
        }));
      const ports = await this.startServer(
        competitionId,
        roundId,
        maps,
        round.view.players.map((x) => x.info.playerName),
        token,
        this.toConfigStrings(v.result.competition.rules, true),
      );
      if (ports.err !== undefined) return ports;
      competition.brackets.rounds[roundId].bannedMaps = banned;
      const address = this.getRaceHost(competitionId);
      if (address !== undefined) {
        const addr = address.split('//').reverse()[0].split(':')[0];
        for (const p of round.view.players) {
          p.serverUrl = `${addr}:${ports.result[p.info.playerName]}`;
        }
      } else {
        for (const p of round.view.players) {
          p.serverUrl = undefined;
        }
      }

      round.view.stage = 'Running';
    } else {
      if (competition.brackets === undefined) return badRequest(`Competition ${competition.id} is in invalid state`);
      if (competition.players[stateOrWinner] === undefined) {
        return badRequest(
          `Competition ${competition.id} round ${round.round} is reported with winner '${stateOrWinner}' out of bounds.`,
        );
      }
      competition.brackets.rounds[round.round].winnerIndex = stateOrWinner;
      round.view.stage = 'Completed';
      round.view.winner = stateOrWinner;
      this.updateBracket(competition);
      await this.terminateServer(competitionId, roundId, token);

      // delete this.rounds[round.view.id];
    }
    this.notifyRoundUpdate(round);
    return result(round.view);
  }

  // #region private helpers

  private validateCompetition(competitionId: string, token?: string, validateToken = true): Result<CompetitionData> {
    const competition = this.competitions[competitionId];
    if (competition === undefined || (validateToken && competition.adminToken !== token)) {
      return notFound(`Competition with id='${competitionId}' is not found`);
    }
    return result(competition);
  }

  private async validateBanRound(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    adminOnly: boolean,
    checkBanStage: boolean,
  ): AsyncResult<{ round: RoundData; competition: CompetitionView }> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, token, false);
    if (err !== undefined) return error(err);
    const competition = competitionData.view;
    const round = competitionData.rounds[roundId];
    if (round === undefined) {
      return notFound(`Round with id='${roundId}' is not found`);
    }

    if (checkBanStage && round.view.stage !== 'Ban') {
      return badRequest(`Round ban stage is completed`);
    }

    if (competition === undefined || competition.brackets === undefined) {
      // dangling round by any reason (hasn't to be happened)
      this.notifyRoundRemoved(competitionData.rounds[roundId]);
      delete competitionData.rounds[roundId];
      return notFound(`Round with id='${roundId}' is not associated with any competition`);
    }
    const currentPlayer = round.players[round.view.banTurn];
    const userId = await this.getUserIdAuth(token);
    if (
      competitionData.adminToken !== token &&
      (adminOnly ||
        ((currentPlayer.userId === undefined || currentPlayer.userId !== userId) && currentPlayer.token !== token))
    ) {
      return notAllowed('Map ban is not allowed with this user');
    }
    return result({ round, competition });
  }

  private notifyRoundUpdate(round: RoundData) {
    this.competitions[round.competitionId]?.stream?.next({
      id: round.competitionId,
      roundUpdate: {
        [round.round]: round.view,
      },
    });
  }

  private notifyRoundRemoved(round: RoundData) {
    this.competitions[round.competitionId]?.stream?.next({
      id: round.competitionId,
      roundUpdate: { [round.round]: null },
    });
  }

  private updateBracket(competition: CompetitionView) {
    if (competition.brackets === undefined) return;
    for (let i = competition.brackets.rounds.length >> 1; i >= 0; --i) {
      const r0 = (i << 1) + 1;
      const r1 = (i << 1) + 2;
      const w0 = competition.brackets.rounds[r0]?.winnerIndex;
      if (w0 !== undefined) {
        competition.brackets.rounds[i].players[0] = competition.brackets.rounds[r0].players[w0];
      }
      const w1 = competition.brackets.rounds[r1]?.winnerIndex;
      if (w1 !== undefined) {
        competition.brackets.rounds[i].players[1] = competition.brackets.rounds[r1].players[w1];
      }
    }
    this.competitions[competition.id]?.stream?.next({
      id: competition.id,
      bracketUpdate: competition.brackets,
    });
  }
  // #endregion
  private async startServer(
    competitionId: string,
    roundId: number,
    maps: { mapName: string; config?: string[]; estTime?: number }[],
    players: string[],
    token: string | undefined,
    customConfig?: string[],
  ): Promise<Result<Record<string, number>>> {
    // request data type: {
    //   "token": string,
    //   "report_host": string,
    //   "report_path": string,
    //   "competitionId": string,
    //   "roundId": int,
    //   "players": string[],
    //   "maps": { name: string; config?: string[]; estTime?: number }[],
    //   "warmup_map": string,
    //   "warmup_time": float,
    //   "max_disconnects": int,
    //   "reconnect_timeout": float,
    //   "afterlevel_time": float,
    //   "aftermatch_time": float,
    //   "beforestart_gap": float,
    // }
    const p = this.getRaceHost(competitionId);
    if (p === undefined) return result({});
    const url = `${p}/round/start`;
    try {
      const serverHostRequest = await axios.post(url, {
        token,
        competitionId,
        roundId,
        report_path: `/competitions/${competitionId}/rounds/${roundId}/complete`,
        reset_path: `/competitions/${competitionId}/rounds/${roundId}/reset`,
        players,
        maps,
        custom_config: customConfig,
      });
      if (serverHostRequest.status >= 300) {
        console.warn(`ServerHost[${serverHostRequest.status}]`);
        return error({
          code: 'InternalError',
          message: `Connection failed with status code ${serverHostRequest.status}`,
        });
      }
      const data = serverHostRequest.data;
      if (!isResult(data)) {
        console.warn(`ServerHost Error: Invalid result received. ${JSON.stringify(data)}`);
        return error({ code: 'InternalError', message: `Invalid result received:` });
      }
      if (data.err !== undefined) {
        console.warn(`ServerHost Error: ${data.err.message}`);
        return data;
      }
      const portDict = Object.fromEntries(data.result);
      return result(portDict);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response) {
        console.warn(`ServerHost[${e.response.status}]: ${JSON.stringify(e.response.data)}`);
        return error({ code: 'InternalError', message: `Connection failed with status code ${e.response.status}` });
      } else if (e.request) {
        return error({ code: 'InternalError', message: `Empty response` });
      } else {
        return error({ code: 'InternalError', message: e.message });
      }
    }
  }
  private async terminateServer(
    competitionId: string,
    roundId: number,
    token: string | undefined,
  ): Promise<Result<Record<string, number>>> {
    // request data type: {
    //   "token": string,
    //   "competitionId": string,
    //   "roundId": int,
    // }
    const p = this.getRaceHost(competitionId);
    if (p === undefined) return result({});
    const url = `${p}/round/terminate`;
    try {
      const serverHostRequest = await axios.post(url, {
        token,
        competitionId,
        roundId,
      });
      if (serverHostRequest.status >= 300) {
        console.warn(`ServerHost[${serverHostRequest.status}]`);
        return error({
          code: 'InternalError',
          message: `Connection failed with status code ${serverHostRequest.status}`,
        });
      }
      return result({});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response) {
        console.warn(`ServerHost[${e.response.status}]: ${JSON.stringify(e.response.data)}`);
        return error({ code: 'InternalError', message: `Connection failed with status code ${e.response.status}` });
      } else if (e.request) {
        return error({ code: 'InternalError', message: `Empty response` });
      } else {
        return error({ code: 'InternalError', message: e.message });
      }
    }
  }

  private async getMapInfo(mapName: string): Promise<MapInfo | undefined> {
    const url = `http://ws.q3df.org/map/${mapName}`;
    try {
      const page = await axios.get(url);
      if (page.status >= 300) return undefined;
      //{ err: `Unable to fetch map [${page.status}]: ${page.statusText}` };
      // const doc = new dom().parseFromString(page.data);
      // xpath.parse();
      return {
        mapName,
        levelShotUrl: `http://ws.q3df.org/images/authorshots/512x384/${mapName}.jpg`,
        worldspawnUrl: url,
        config: {},
        estTime: -1,
      };
    } catch {
      return undefined;
    }
  }
  private async getPlayerInfo(playerName: string): Promise<PlayerInfo | undefined> {
    // return { playerName };
    const result = { playerName };
    const url = process.env.NODE_ENV === 'production' ? 'api/profile/search' : 'http://localhost:4001/profile/search';
    try {
      const response = await axios.get(url, {
        params: {
          nick: playerName,
        },
      });
      if (response.status >= 300) return result;
      if (!response.data?.length) return result;
      return {
        userId: response.data[0],
        playerName,
      };
    } catch {
      return result;
    }
  }

  private async getUserIdAuth(token: string | undefined): Promise<number | undefined> {
    if (token === undefined) return undefined;
    // return undefined;
    const url = process.env.NODE_ENV === 'production' ? 'api/auth/user' : 'http://localhost:4001/auth/user';
    console.log(url);
    console.log(token);
    try {
      const response = await axios.get(url, {
        headers: { 'X-Auth': token },
      });

      if (response.status >= 300) return undefined;
      console.log(response.data);
      return response.data ?? undefined;
    } catch {
      return undefined;
    }
  }

  private getRaceHost(competitionId?: string): string | undefined {
    const { err, result: compet } =
      competitionId !== undefined
        ? this.validateCompetition(competitionId, undefined, false)
        : { err: undefined, result: undefined };
    const p =
      this.serverHostPort === undefined ? this.serverHostAddress : `${this.serverHostAddress}:${this.serverHostPort}`;
    if (err === undefined && compet !== undefined && compet.view.rules.raceServerHost !== undefined) {
      return compet.view.rules.raceServerHost;
    }
    return p;
  }

  private async validateRaceHost(url: string): Promise<boolean> {
    try {
      console.log(`Checking host ${url}/version`);
      const res = await axios.get(`${url}/version`);
      if (res.status >= 300) return false;
      const data = res.data;
      return (
        data['version'] !== undefined &&
        isArray(data['version'], isInteger) &&
        data['version'].length === 3 &&
        data['version'][0] >= 1
      );
    } catch {
      return false;
    }
  }
}
