import faker from 'faker';
import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';

describe('end-to-end: case 3 - double browser page', () => {
    let webSocketFirst: WebSocket;
    let playerId: string;
    let webSocketSecond: WebSocket;

    beforeAll(() => {
        webSocketFirst = new WebSocket('ws://localhost:3000/1v1');
        playerId = faker.random.uuid();
        webSocketSecond = new WebSocket('ws://localhost:3000/1v1');

        return Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onopen = () => {
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onopen = () => {
                    resolve(null);
                };
            }),
        ]);
    });

    it('should get PLAYER_STATE on first correct message', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: DuelWebsocketServerActions.PLAYER_STATE, payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        };

        webSocketFirst.send(JSON.stringify({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    it('should get DUPLICATE_CLIENT on two sockets open', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: DuelWebsocketServerActions.DUPLICATE_CLIENT });
            done();
        };

        webSocketSecond.send(JSON.stringify({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
    });
});
