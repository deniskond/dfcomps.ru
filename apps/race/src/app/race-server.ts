import express from 'express';
import expressWs from 'express-ws';
import cookieParser from 'cookie-parser';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as util from 'util';
import { RaceController } from './race/race-controller';
import { ErrorCode, Result, badRequest, notAllowed, result } from './race/types/result';
import { isInMessage } from './interfaces/message.interface';
import { createHash, createCipheriv, randomBytes } from 'crypto';
import {
  isCompetitionCreateInfo,
  isOptionalCustomizableConfig,
  isRawCompetitionInfo,
} from './race/interfaces/views.interface';
import { AddressInfo } from 'net';

export class RaceServer {
  private readonly SERVER_PORT = 4006;
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
    InternalError: 500,
  };
  private _allowed_tokens: Record<string, { login: string; password: string }>;
  private _key: Buffer;
  private _iv: Buffer;
  private response<Type>(response: express.Response, result: Result<Type>): void {
    response.setHeader('Access-Control-Allow-Origin', '*');
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
    const token = request.cookies['token'];
    if (token === undefined || !(token in this._allowed_tokens)) return undefined;
    return token;
  }
  private getUserToken(request: express.Request): string | undefined {
    const token = request.headers['X-Auth'];
    if (token === undefined) return token;
    if (typeof token === 'string') return token;
    return token[0];
  }
  private hashPassword(password: string): string {
    const hash = createHash('sha256');
    return hash.update(password, 'utf-8').digest('base64');
  }
  private tokenize(login: string, passwordHash: string): string {
    const cipher = createCipheriv('aes-256-cbc', this._key, this._iv);
    let encr = cipher.update(`${process.env.SALT}${login}###${passwordHash}${process.env.SALT}`, 'utf-8', 'base64url');
    encr += cipher.final('base64url');
    return encr;
  }
  constructor() {
    this._key = randomBytes(32);
    this._iv = randomBytes(16);
    const logins = [];
    if (process.env.NODE_ENV === 'production') {
      if (process.env.RACE_WOODY_PASS !== undefined)
        logins.push({ login: 'w00deh', password: process.env.RACE_WOODY_PASS });
      if (process.env.RACE_RANTRAVE_PASS !== undefined)
        logins.push({ login: 'rantrave', password: process.env.RACE_RANTRAVE_PASS });
      if (process.env.RACE_NOSF_PASS !== undefined)
        logins.push({ login: 'Nosf', password: process.env.RACE_NOSF_PASS });
    } else {
      logins.push({ login: 'w00deh', password: 'w00deh' });
      logins.push({ login: 'rantrave', password: 'rantrave' });
      logins.push({ login: 'Nosf', password: 'Nosf' });
      logins.push({ login: '', password: '' });
    }
    this._allowed_tokens = {};
    for (const l of logins) {
      this._allowed_tokens[this.tokenize(l.login, this.hashPassword(l.password))] = l;
      console.log(this.hashPassword(l.password));
    }

    this.express = express();
    this.expressWs = expressWs(this.express);
    // this.server = http.createServer(this.express);
    const shp = parseInt(process.env.SERVER_HOST_PORT ?? '');
    this.raceController = new RaceController(process.env.SERVER_HOST_ADDRESS, isNaN(shp) ? undefined : shp);
    const app = this.expressWs.app;

    app.use(express.json());
    app.use(cookieParser());

    app.get('/assets/:resource(*)', async (req: express.Request, res: express.Response) => {
      console.log(__dirname + '/assets/' + req.params.resource);
      res.sendFile(__dirname + '/assets/' + req.params.resource);
    });

    app.get('/app.html', async (req: express.Request, res: express.Response) => {
      const frontendLocation = process.env.NODE_ENV === 'production' ? './pure-js.html' : 'apps/race/src/pure-js.html';
      // res.sendFile(__dirname + '/../../../apps/race/src/pure-js.html');
      const html = await new Promise((r, j) =>
        fs.readFile(frontendLocation, (err, b) => {
          if (err) j(err);
          else r(b);
        }),
      );
      res.status(200).setHeader('Content-Type', 'text/html').send(html);
    });
    app.get('/banner.html', async (req: express.Request, res: express.Response) => {
      const frontendLocation = process.env.NODE_ENV === 'production' ? './banner.html' : 'apps/race/src/banner.html';
      // res.sendFile(__dirname + '/../../../apps/race/src/pure-js.html');
      const html = await new Promise((r, j) =>
        fs.readFile(frontendLocation, (err, b) => {
          if (err) j(err);
          else r(b);
        }),
      );
      res.status(200).setHeader('Content-Type', 'text/html').send(html);
    });

    app.route('/authorize').post((req: express.Request, res: express.Response) => {
      let token = this.getAdminToken(req);
      console.log(`TOKEN ${token}`);
      if (token !== undefined) {
        res.setHeader(
          'Set-Cookie',
          `token=${token}; Secure; Expires=${new Date(new Date().getTime() + 3600000).toUTCString()}`,
        );
        this.response(res, result(token));
        return;
      }
      const body = req.body;
      if (typeof body?.login !== 'string' || typeof body?.passwordHash !== 'string') {
        this.response(res, badRequest('bad login format'));
        return;
      }
      token = this.tokenize(body.login, body.passwordHash);
      if (token in this._allowed_tokens) {
        res.setHeader(
          'Set-Cookie',
          `token=${token}; Secure; Expires=${new Date(new Date().getTime() + 3600000).toUTCString()}`,
        );
        this.response(res, result(token));
        return;
      }
      this.response(res, notAllowed('bad login'));
    });
    app
      .route('/competitions')
      .post((req: express.Request, res: express.Response) => {
        const token = this.getAdminToken(req);
        if (!isCompetitionCreateInfo(req.body)) {
          this.invalidType(res, 'CompetitionRules expected at body');
          return;
        }
        this.raceController.createCompetition(req.body, token).then((x) => this.response(res, x));
      })
      .get((req: express.Request, res: express.Response) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.listCompetitions(token));
      })
      .put((req: express.Request, res: express.Response) => {
        const token = this.getAdminToken(req);
        this.log(JSON.stringify(req.body));
        if (!isRawCompetitionInfo(req.body)) {
          this.invalidType(res, 'RawCompetitionInfo expected at body');
        }
        this.raceController.makeCompetition(req.body, token).then((r) => this.response(res, r));
      });
    app
      .route('/competitions/:competitionId')
      .get((req, res) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.getCompetition(req.params.competitionId, token));
      })
      .delete((req, res) => {
        const token = this.getAdminToken(req);
        this.response(res, this.raceController.removeCompetition(req.params.competitionId, token));
      });

    app.route('/competitions/:competitionId/stage').get((req, res) => {
      this.raceController.getRoundProgress(req.params.competitionId, undefined).then((x) => this.response(res, x));
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
        const v = this.raceController.getCompetition(req.params.competitionId, undefined);
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
      .post((req, res) => {
        const token = this.getAdminToken(req);
        if (req.query.name === undefined || typeof req.query.name !== 'string') {
          this.invalidType(res, "Expected 'map' query string parameter");
          return;
        }
        const config = req.body;
        if (!isOptionalCustomizableConfig(config)) {
          this.invalidType(res, 'OptionalCustomizableConfig expected at body');
          return;
        }
        this.response(
          res,
          this.raceController.updateMapConfig(req.params.competitionId, token, req.query.name, config),
        );
      })
      .get((req, res) => {
        const v = this.raceController.getCompetition(req.params.competitionId, undefined);
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

    app.route('/competitions/:competitionId/rounds/:roundId/stage').get((req, res) => {
      const roundId = parseInt(req.params.roundId);
      if (isNaN(roundId)) {
        this.invalidType(res, "Expected 'roundId' to be round index");
        return;
      }
      this.raceController.getRoundProgress(req.params.competitionId, roundId).then((x) => this.response(res, x));
    });
    app.route('/competitions/:competitionId/rounds/:roundId/complete').post(async (req, res) => {
      const token = this.getAdminToken(req);
      const roundId = parseInt(req.params.roundId);
      if (isNaN(roundId)) {
        this.invalidType(res, "Expected 'roundId' to be round index");
        return;
      }
      const body = req.body;
      if (typeof body?.winner !== 'number') {
        this.response(res, badRequest('bad "winner" index'));
        return;
      }
      this.response(res, await this.raceController.roundSet(req.params.competitionId, roundId, token, body.winner));
    });
    app.route('/competitions/:competitionId/rounds/:roundId/reset').post(async (req, res) => {
      const token = this.getAdminToken(req);
      const roundId = parseInt(req.params.roundId);
      if (isNaN(roundId)) {
        this.invalidType(res, "Expected 'roundId' to be round index");
        return;
      }
      this.response(res, await this.raceController.roundSet(req.params.competitionId, roundId, token, 'Restart'));
    });
    app.ws('/bracket/:competitionId', async (ws, req: express.Request) => {
      this.log(`new connection to ${req.params.competitionId}`);
      const competitionId = req.params.competitionId;
      const adminToken = this.getAdminToken(req);
      let userToken: string | undefined = this.getUserToken(req);

      if (req.query.token !== undefined && typeof req.query.token == 'string') {
        userToken = req.query.token;
      }
      const token = adminToken ?? userToken;
      // if (isNaN(roundId)) {
      //   ws.send(JSON.stringify({ err: { code: 'BadRequest', message: "Expected 'roundId' to be round index" } }));
      //   ws.close();
      //   return;
      // }
      const subscription = await this.raceController.subscribe(competitionId, token, (x) => {
        ws.send(JSON.stringify(result(x)));
      });
      if (subscription.err !== undefined) {
        try {
          ws.send(JSON.stringify(subscription));
          ws.close();
        } catch (e) {
          console.error(e);
        }
        console.log('Connection closed');
        return;
      }
      await this.raceController.getUpdate(competitionId, token);
      // ws.send(JSON.stringify(this.raceController.getRoundView(competitionId, roundId, token)));
      subscription.result.add(() => {
        ws.close(200);
      });
      // [FIXME] probable race condition, should use queued messages instead of straight async
      ws.on('message', async (msg) => {
        const message = JSON.parse(msg.toString('utf-8'));
        if (!isInMessage(message)) {
          this.log(`unknown message: ${msg.toString('utf-8')} from ${token}`);
          return;
        }
        let res;
        switch (message.action) {
          case 'Update':
            res = await this.raceController.getUpdate(competitionId, token);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Ban':
            res = await this.raceController.roundBan(competitionId, message.roundId, token, message.mapIndex);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Unban':
            res = await this.raceController.roundUnban(competitionId, message.roundId, token, message.mapIndex);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Start':
          case 'Reset':
            res = await this.raceController.roundSet(competitionId, message.roundId, token, message.action);
            if (res.err !== undefined) {
              this.log(`${message.action}: ${res.err.message}`);
              ws.send(JSON.stringify(res));
            }
            break;
          case 'Complete':
            res = await this.raceController.roundSet(competitionId, message.roundId, token, message.winner);
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
    });
    const listener = app.listen(this.SERVER_PORT, () => {
      const serverAddress = listener.address() as AddressInfo;
      console.log(`Server started on ${serverAddress.port} :>`);
    });
  }
  private log(message: string): void {
    if (process.env.LOGS !== 'none') {
      this.log_file.write(Date.now() + ' | ' + util.format(message) + '\n');
      this.log_stdout.write(Date.now() + ' | ' + util.format(message) + '\n');
    }
  }
}
