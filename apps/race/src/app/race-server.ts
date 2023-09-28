import express from 'express';
import expressWs from 'express-ws';
import cookieParser from 'cookie-parser';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as util from 'util';
import { RaceController } from './race/race-controller';
import { ErrorCode, Result, result } from './race/types/result';
import { isInMessage } from './interfaces/message.interface';
import { createHash } from 'crypto';
import { SecretsConfig } from './race/config/secret';
import { isCompetitionRules } from './race/interfaces/views.iterface';
// import { ParsedQs } from 'qs';

export class RaceServer {
  private readonly SERVER_PORT = 4004;
  private raceController: RaceController;
  private log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
  private log_stdout = process.stdout;
  express: express.Express;
  expressWs: expressWs.Instance;

  private static statusMap: Record<ErrorCode, number> = {
    BadRequest: 400,
    DuplicateKey: 409,
    NotAllowed: 403,
    NotFound: 404,
  };
  private response<Type>(response: express.Response, result: Result<Type>): void {
    if (result.err !== undefined) {
      response.status(RaceServer.statusMap[result.err.code]).send(result.err.message);
      return;
    }
    response.status(200).json(result.result);
  }
  private invalidType(response: express.Response, message: string) {
    response.status(RaceServer.statusMap.BadRequest).send(message);
  }
  private getAdminToken(request: express.Request): string | undefined {
    // [FIXME] after cookie fix remove hashing
    const hash = createHash('shake256');
    const login = request.cookies['login'];
    const passw = request.cookies['password'];
    if (login === undefined || passw === undefined) return undefined;
    return hash
      .update(request.cookies['login'] + request.cookies['password'] + SecretsConfig.TOKEN_SALT, 'utf-8')
      .digest('base64url');
  }
  constructor() {
    this.express = express();
    this.expressWs = expressWs(this.express);
    // this.server = http.createServer(this.express);
    this.raceController = new RaceController();
    const app = this.expressWs.app;

    app.use(express.json());
    app.use(cookieParser());

    app
      .route('/competitions')
      .post((req: express.Request, res: express.Response) => {
        const token = this.getAdminToken(req);
        if (!isCompetitionRules(req.body)) {
          this.invalidType(res, 'CompetitionRules expected at body');
          return;
        }
        this.response(res, this.raceController.createCompetition(req.body, token));
      })
      .get((req: express.Request, res: express.Response) => {
        this.log('request');
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.listCompetitions(token));
      });
    app
      .route('/competitions/:competitionId')
      .get((req, res) => this.response(res, this.raceController.getCompetition(req.params.competitionId)))
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.removeCompetition(req.params.competitionId, token));
      });

    app
      .route('/competitions/:competitionId/players')
      .put((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.nick === undefined || typeof req.query.nick !== 'string') {
          this.invalidType(res, "Expected 'nick' query string parameter");
          return;
        }
        this.raceController
          .competitionAddPlayer(req.params.competitionId, token, req.query.nick)
          .then((r) => this.response(res, r));
      })
      .get((req, res) => {
        const v = this.raceController.getCompetition(req.params.competitionId);
        if (v.err !== undefined) {
          this.response(res, v);
          return;
        }
        res.json(v.result.players);
      })
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.nick === undefined || typeof req.query.nick !== 'string') {
          this.invalidType(res, "Expected 'nick' query string parameter");
          return;
        }
        this.response(
          res,
          this.raceController.competitionRemovePlayer(req.params.competitionId, token, req.query.nick),
        );
      });
    app
      .route('/competitions/:competitionId/maps')
      .put((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.name === undefined || typeof req.query.name !== 'string') {
          this.invalidType(res, "Expected 'map' query string parameter");
          return;
        }
        this.raceController
          .competitionAddMapIntoPool(req.params.competitionId, token, req.query.name)
          .then((r) => this.response(res, r))
          .catch((r) => this.log(r));
      })
      .get((req, res) => {
        const v = this.raceController.getCompetition(req.params.competitionId);
        if (v.err !== undefined) {
          this.response(res, v);
          return;
        }
        res.json(v.result.mapPool);
      })
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.name === undefined || typeof req.query.name !== 'string') {
          this.invalidType(res, "Expected 'map' query string parameter");
          return;
        }
        this.response(
          res,
          this.raceController.competitionRemoveMapFromPool(req.params.competitionId, token, req.query.name),
        );
      });

    app.post('/competitions/:competitionId/start', (req, res) => {
      const token = this.getAdminToken(req);
      this.raceController.competitionStart(req.params.competitionId, token).then((r) => this.response(res, r));
    });
    app.route('/competitions/:competitionId/rounds/:roundId').post((req, res) => {
      const token = this.getAdminToken(req);
      const roundId = parseInt(req.params.roundId);
      if (isNaN(roundId)) {
        this.invalidType(res, "Expected 'roundId' to be round index");
        return;
      }
      this.response(res, this.raceController.createRound(req.params.competitionId, token, roundId));
    });
    app.ws('/bracket/:competitionId/rounds/:roundId', (ws, req: express.Request) => {
      this.log('new connection to socket');
      // this.raceController.;
      const competitionId = req.params.competitionId;
      const roundId = parseInt(req.params.roundId);
      const adminToken = this.getAdminToken(req);
      let userToken: string | undefined = undefined;

      if (req.query.token !== undefined && typeof req.query.token == 'string') {
        userToken = req.query.token;
      }
      if (isNaN(roundId)) {
        ws.close(
          RaceServer.statusMap.BadRequest,
          JSON.stringify({ err: { code: 'BadRequest', message: "Expected 'roundId' to be round index" } }),
        );
        return;
      }
      const subscription = this.raceController.subscribeRound(competitionId, roundId, (x) => {
        // this.log(`on update ${JSON.stringify(result(x))} ${userToken}`);
        ws.send(JSON.stringify(result(x)));
      });
      if (subscription.err !== undefined) {
        ws.close(RaceServer.statusMap[subscription.err.code], JSON.stringify(subscription));
        return;
      }
      subscription.result.add(() => {
        ws.close(200);
      });

      ws.on('message', (msg) => {
        // this.log(`${msg.toString('utf-8')} token: ${adminToken ?? userToken} ${req.query.token}`);
        const message = JSON.parse(msg.toString('utf-8'));
        if (!isInMessage(message)) {
          this.log('unknown message');
          return;
        }
        let res;
        switch (message.action) {
          case 'Ban':
            res = this.raceController.roundBan(competitionId, roundId, adminToken ?? userToken, message.mapIndex);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Unban':
            res = this.raceController.roundUnban(competitionId, roundId, adminToken ?? userToken, message.mapIndex);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Start':
          case 'Reset':
            res = this.raceController.roundSet(competitionId, roundId, adminToken ?? userToken, message.action);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Complete':
            res = this.raceController.roundSet(competitionId, roundId, adminToken ?? userToken, message.winner);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          default:
            break;
        }
      });

      ws.on('close', (_ws: WebSocket, code: number, reason: Buffer) => {
        this.log(`WebSocket closed [${code}]: ${reason?.toString('utf-8')}`);
        subscription.result.unsubscribe();
      });

      this.log('connected to socket');
    });
    const listener = app.listen(this.SERVER_PORT, () => {
      const serverAddress = listener.address();
      console.log(`Server started on ${serverAddress} :)`);
    });
  }
  private log(message: string): void {
    if (process.env.LOGS !== 'none') {
      this.log_file.write(Date.now() + ' | ' + util.format(message) + '\n');
      this.log_stdout.write(Date.now() + ' | ' + util.format(message) + '\n');
    }
  }
}
