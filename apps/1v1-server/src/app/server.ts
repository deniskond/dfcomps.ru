import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { OneVOneHandler } from './1v1/1v1';
import { DuelClientMessage } from './1v1/types/duel-client-message.type';
import { throwError } from 'rxjs';
import { v4 } from 'uuid';
import * as fs from 'fs';
import * as util from 'util';
import { stressTestNumberOfMatchesInEachPhysics } from './1v1/constants/stress-test-clients-count';

export class OneVOneServer {
  private readonly SERVER_PORT = 3000;
  private server: http.Server;
  private webSocketServer: WebSocket.Server;
  private oneVOneHandler: OneVOneHandler;
  private clientCount: number;
  private log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
  private log_stdout = process.stdout;

  constructor() {
    this.server = http.createServer(express());
    this.webSocketServer = new WebSocket.Server({ server: this.server, path: '/1v1' });
    this.oneVOneHandler = new OneVOneHandler();

    console.log = (message: any) => {
      if (process.env.LOGS !== 'none') {
        this.log_file.write(Date.now() + ' | ' + util.format(message) + '\n');
        this.log_stdout.write(Date.now() + ' | ' + util.format(message) + '\n');
      }
    };

    this.oneVOneHandler.setEligiblePlayersSubscription();
    this.setWSServerHandlers();
  }

  // TODO Нужно выносить всю логику в OneVOneHandler и декомпозировать
  private setWSServerHandlers(): void {
    this.webSocketServer.on('connection', (ws: WebSocket) => {
      const uniqueId = v4();

      ws.on('message', (message: string) => {
        let parsedMessage: DuelClientMessage;

        try {
          parsedMessage = JSON.parse(message);

          if (!parsedMessage.playerId) {
            throwError('Wrong player id');
          }

          this.oneVOneHandler.addClient(parsedMessage.playerId, ws, uniqueId);
          this.oneVOneHandler.processClientMessage(ws, parsedMessage);
        } catch (error) {
          console.log(`ERROR: ${error}`);
        }
      });

      ws.on('close', (_) => {
        console.log(`closing ${uniqueId}`);

        this.oneVOneHandler.removeClient(uniqueId);
        this.clientCount++;

        // not very cool to check it like this, but SIGTERM from 'concurrently' is not processing correctly for some reason
        if (process.env.E2E === 'true' && this.clientCount === stressTestNumberOfMatchesInEachPhysics * 4 * 2) {
          process.exit(0);
        }
      });

      ws.addListener('close', (code, message) => {
        console.log(`closing with code ${code}, message: ${message}`);
      });
    });

    this.server.listen(this.SERVER_PORT, () => {
      const serverAddress = this.server.address() as WebSocket.AddressInfo;

      this.oneVOneHandler.initSubscriptions();

      console.log(`Server started on port ${serverAddress.port} :)`);
    });
  }
}
