import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { OneVOneHandler } from './1v1/1v1';
import { DuelClientMessage } from './1v1/types/duel-client-message.type';
import { throwError, BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';
import * as fs from 'fs';
import * as util from 'util';

const SERVER_PORT = 3000;

const server = http.createServer(express());
const webSocketServer = new WebSocket.Server({ server, path: '/1v1' });
const oneVOneHandler = new OneVOneHandler();

var log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
var log_stdout = process.stdout;

console.log = function (message: any) {
    log_file.write(util.format(message) + '\n');
    log_stdout.write(util.format(message) + '\n');
};

// TODO Нужно выносить всю логику в OneVOneHandler и декомпозировать
webSocketServer.on('connection', function connection(ws: WebSocket) {
    const uniqueId = uuid.v4();

    ws.on('message', function incoming(message: string) {
        let parsedMessage: DuelClientMessage;

        try {
            parsedMessage = JSON.parse(message);

            if (!parsedMessage.playerId) {
                throwError('Wrong player id');
            }

            oneVOneHandler.addClient(parsedMessage.playerId, ws, uniqueId);
            oneVOneHandler.processClientMessage(ws, parsedMessage);
        } catch (error) {
            console.log(`ERROR: ${error}`);
        }
    });

    ws.on('close', function onClose(ws: WebSocket) {
        console.log(`closing ${uniqueId}`);
        oneVOneHandler.removeClient(uniqueId);
    });
});

server.listen(SERVER_PORT, () => {
    const serverAddress = server.address() as WebSocket.AddressInfo;

    oneVOneHandler.initSubscriptions();

    console.log(`Server started on port ${serverAddress.port} :)`);
});
