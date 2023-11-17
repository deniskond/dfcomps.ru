import axios from 'axios';
import { Subject, Subscription } from 'rxjs';
import { v4 } from 'uuid';
import { AsyncResult, Result, badRequest, duplicate, error, notAllowed, notFound, result } from './types/result';
import {
  CompetitionRules,
  CompetitionView,
  Round,
  RoundView,
  MapInfo,
  PlayerInfo,
  CompetitionCreateInfo,
} from './interfaces/views.interface';
import { CompetitionData, RoundData } from './interfaces/data.interface';
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

  public createCompetition(info: CompetitionCreateInfo, token: string | undefined): Result<CompetitionView> {
    if (token === undefined) {
      return notAllowed('You must be logged in to create competitions');
    }
    const res = { id: v4(), mapPool: [], players: [], ...info };
    this.competitions[res.id] = { view: res, adminToken: token, rounds: {} };
    return result(res);
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
    const toRemove: string[] = [];
    for (const [id, round] of Object.entries(competition.rounds)) {
      if (round.competitionId === competitionId) {
        round.stream.complete();
        toRemove.push(id);
      }
    }
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
    console.log(JSON.stringify(res));
    return result(res);
  }
  public competitionUpdateRules(
    competitionId: string,
    token: string | undefined,
    rules: CompetitionRules,
  ): Result<CompetitionView> {
    const { err, result: competition } = this.validateCompetition(competitionId, token);
    if (err !== undefined) return error(err);
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
    const mapInfo = await this.getPlayerInfo(playerName);
    if (mapInfo === undefined) {
      return notFound(`Player ${playerName} is not found`);
    }
    return result(competition.players.push(mapInfo) - 1);
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
    if (competition.rules.numBans > competition.mapPool.length / 6) {
      return badRequest(
        `Not enough maps in pool for ${competition.rules.numBans}. At least ${6 * competition.rules.numBans} expected`,
      );
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
        circle.push({ players: [undefined, undefined] });
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

  public createRound(
    competitionId: string,
    token: string | undefined,
    round: number,
  ): Result<RoundView & { tokens: { token: string }[] }> {
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
    if (p0 === undefined || p1 === undefined) {
      return badRequest(`Players are not ready to round ${round}`);
    }
    const r0 = competition.brackets.rounds[(round << 1) + 1];
    const r1 = competition.brackets.rounds[(round << 1) + 2];
    const forbiddenBans = [...(r0?.bannedMaps ?? []), ...(r1?.bannedMaps ?? [])];
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
      stream: new Subject<RoundView>(),
      players: [{ token: v4() }, { token: v4() }],
      competitionId,
      round,
    };
    return result({ ...roundView, tokens: competitionData.rounds[round].players });
  }
  public subscribeRound(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    onUpdate: (x: RoundView & { tokens?: { token: string }[]; index: number }) => void,
  ): Result<Subscription> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, undefined, false);
    if (err !== undefined) return error(err);
    const round = competitionData.rounds[roundId];
    if (round === undefined) {
      return notFound(`Round with id='${roundId}' is not found in competition ${competitionId}`);
    }
    const index = round.players.findIndex((x) => x.token === token);
    if (competitionData.adminToken === token) {
      return result(
        round.stream.subscribe((rw) => onUpdate({ ...rw, tokens: competitionData.rounds[roundId].players, index })),
      );
    }
    return result(round.stream.subscribe((rw) => onUpdate({ ...rw, index })));
  }

  public getRoundView(
    competitionId: string,
    roundId: number,
    token?: string,
  ): Result<RoundView & { index: number; tokens?: { token: string }[] }> {
    const { err, result: competitionData } = this.validateCompetition(competitionId, undefined, false);
    if (err !== undefined) return error(err);
    const round = competitionData.rounds[roundId];
    if (round === undefined) {
      return notFound(`Round with id='${roundId}' is not found in competition ${competitionId}`);
    }
    if (competitionData.adminToken === token) {
      return result({ ...round.view, index: -1, tokens: competitionData.rounds[roundId].players });
    }
    const index = round.players.findIndex((x) => x.token === token);
    return result({ ...round.view, index });
  }

  public roundBan(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    mapIndex: number,
  ): Result<RoundView> {
    const v = this.validateBanRound(competitionId, roundId, token, false, true);
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
  public roundUnban(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    mapIndex: number,
  ): Result<RoundView> {
    const v = this.validateBanRound(competitionId, roundId, token, true, true);
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
  public roundSet(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    stateOrWinner: 'Reset' | 'Start' | number,
  ): Result<RoundView> {
    const v = this.validateBanRound(competitionId, roundId, token, true, false);
    if (v.err !== undefined) return v;
    const { round, competition } = v.result;
    if (stateOrWinner === 'Reset') {
      round.view.stage = 'Ban';
      round.view.bans = {};
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
      competition.brackets.rounds[roundId].bannedMaps = Object.keys(round.view.bans).map((x) => parseInt(x));
      // [TODO] add api call for port retrieval

      for (const p of round.view.players) {
        p.serverUrl = '127.0.0.1:27970';
      }

      round.view.stage = 'Running';
    } else {
      if (competition.brackets === undefined) return badRequest(`Competition ${competition.id} is in invalid state`);
      competition.brackets.rounds[round.round].winnerIndex = stateOrWinner;
      this.updateBracket(competition);
      round.view.stage = 'Completed';
      round.view.winner = stateOrWinner;
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

  private validateBanRound(
    competitionId: string,
    roundId: number,
    token: string | undefined,
    adminOnly: boolean,
    checkBanStage: boolean,
  ): Result<{ round: RoundData; competition: CompetitionView }> {
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
      round.stream.complete();
      delete competitionData.rounds[roundId];
      return notFound(`Round with id='${roundId}' is not associated with any competition`);
    }
    const currentPlayer = round.players[round.view.banTurn];
    if (competitionData.adminToken !== token && (adminOnly || currentPlayer.token !== token)) {
      return notAllowed('Map ban is not allowed with this user');
    }
    return result({ round, competition });
  }

  private notifyRoundUpdate(round: RoundData) {
    round.stream.next(round.view);
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
  }
  // #endregion
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
      };
    } catch {
      return undefined;
    }
  }
  private async getPlayerInfo(playerName: string): Promise<PlayerInfo | undefined> {
    return {
      playerName: playerName,
    };
  }
}
