import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import * as faker from 'faker';
import { Physics } from '../../enums/physics.enum';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { PickbanStepMessageInterface } from '../interfaces/pickban-step-message.interface';

describe('end-to-end: case 1a - joining and leaving queue', () => {
    let webSocket: WebSocket;
    let playerId: string;
    let physics: Physics;

    beforeAll(() => {
        webSocket = new WebSocket('ws://localhost:3000/1v1');
        playerId = faker.random.uuid();
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

describe('end-to-end: case 1b - checking if player left queue after disconnect', () => {
    let webSocketFirst: WebSocket;
    let playerIdFirst: string;
    let webSocketSecond: WebSocket;
    let playerIdSecond: string;
    let physics: Physics;

    beforeAll(() => {
        webSocketFirst = new WebSocket('ws://localhost:3000/1v1');
        playerIdFirst = faker.random.uuid();
        webSocketSecond = new WebSocket('ws://localhost:3000/1v1');
        playerIdSecond = faker.random.uuid();
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

        const message: GetPlayerStateMessageInterface = { playerId: playerIdFirst, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

        webSocketFirst.send(JSON.stringify(message));
    });

    it('should get answer on GET_PLAYER_STATE: second player', (done) => {
        webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        };

        const message: GetPlayerStateMessageInterface = { playerId: playerIdSecond, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

        webSocketSecond.send(JSON.stringify(message));
    });

    it('should get answer on JOIN_QUEUE: first player', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
            done();
        };

        const message: JoinQueueMessageInterface = {
            playerId: playerIdFirst,
            action: DuelWebsocketClientActions.JOIN_QUEUE,
            payload: {
                physics,
            },
        };

        webSocketFirst.send(JSON.stringify(message));
    });

    it('should not find a match if first player left', (done) => {
        webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });

            webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                const pickbanSteps: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                expect(pickbanSteps.payload.match.firstPlayerId).not.toBe(playerIdFirst);
                expect(pickbanSteps.payload.match.secondPlayerId).not.toBe(playerIdFirst);
            };

            setTimeout(() => {
                done();
            }, 3000);
        };

        webSocketFirst.onclose = () => {
            const message: JoinQueueMessageInterface = {
                playerId: playerIdSecond,
                action: DuelWebsocketClientActions.JOIN_QUEUE,
                payload: {
                    physics,
                },
            };

            webSocketSecond.send(JSON.stringify(message));
        };

        webSocketFirst.close();
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
    });
});
