import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import * as faker from 'faker';
import { Physics } from '../../enums/physics.enum';

describe('end-to-end: case 1 - joining and leaving queue', function () {
    let webSocket: WebSocket;
    let playerId: number;
    let physics: Physics;

    beforeAll(() => {
        webSocket = new WebSocket('ws://localhost:3000/1v1');
        playerId = faker.random.number();
        physics = faker.random.arrayElement([Physics.VQ3, Physics.CPM]);

        return new Promise((resolve) => {
            webSocket.onopen = () => {
                resolve(null);
            };
        });
    });

    it('should get answer on GET_PLAYER_STATE', (done) => {
        webSocket.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        };

        webSocket.send(JSON.stringify({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    it('should get answer on JOIN_QUEUE', (done) => {
        webSocket.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
            done();
        };

        webSocket.send(
            JSON.stringify({
                playerId,
                action: DuelWebsocketClientActions.JOIN_QUEUE,
                payload: {
                    physics,
                },
            }),
        );
    });

    it('should get error on second JOIN_QUEUE', (done) => {
        webSocket.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_FAILURE', payload: { error: 'Already in queue' } });
            done();
        };

        webSocket.send(
            JSON.stringify({
                playerId,
                action: DuelWebsocketClientActions.JOIN_QUEUE,
                payload: {
                    physics,
                },
            }),
        );
    });

    it('should leave queue correctly', (done) => {
        webSocket.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'LEAVE_QUEUE_SUCCESS' });
            done();
        };

        webSocket.send(
            JSON.stringify({
                playerId,
                action: DuelWebsocketClientActions.LEAVE_QUEUE,
                payload: {
                    physics,
                },
            }),
        );
    });

    afterAll(() => {
        webSocket.close();
    });
});
