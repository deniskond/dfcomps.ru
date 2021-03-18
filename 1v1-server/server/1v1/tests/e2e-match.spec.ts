import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import * as faker from 'faker';
import { Physics } from '../../enums/physics.enum';

describe('end-to-end: case 2 - full match', function () {
    let webSocketFirst: WebSocket;
    let playerIdFirst: number;
    let webSocketSecond: WebSocket;
    let playerIdSecond: number;
    let physics: Physics;

    beforeAll(() => {
        webSocketFirst = new WebSocket('ws://localhost:3000/1v1');
        playerIdFirst = faker.random.number();
        webSocketSecond = new WebSocket('ws://localhost:3000/1v1');
        playerIdSecond = faker.random.number();
        physics = faker.random.arrayElement([Physics.VQ3, Physics.CPM]);

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

    it('should get answer on GET_PLAYER_STATE: first player', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        };

        webSocketFirst.send(JSON.stringify({ playerId: playerIdFirst, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    it('should get answer on GET_PLAYER_STATE: second player', (done) => {
        webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        };

        webSocketSecond.send(JSON.stringify({ playerId: playerIdSecond, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    it('should get answer on JOIN_QUEUE: first player', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
            done();
        };

        webSocketFirst.send(
            JSON.stringify({
                playerId: playerIdFirst,
                action: DuelWebsocketClientActions.JOIN_QUEUE,
                payload: {
                    physics,
                },
            }),
        );
    });

    it('should get answer on JOIN_QUEUE: second player', (done) => {
        webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
            console.log(JSON.parse(serverMessage.data));

            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
            done();
        };

        webSocketSecond.send(
            JSON.stringify({
                playerId: playerIdSecond,
                action: DuelWebsocketClientActions.JOIN_QUEUE,
                payload: {
                    physics,
                },
            }),
        );
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
    });
});
