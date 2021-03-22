import faker from 'faker';
import { Physics } from '../../enums/physics.enum';
import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { MatchInterface } from '../interfaces/match.interface';
import { PickbanMapServerInterface } from '../interfaces/pickban-map-server.interface';
import { PickbanStepMessageInterface } from '../interfaces/pickban-step-message.interface';
import { pickbanStepMock } from './mocks/pickban-step.mock';

describe('end-to-end: case 4 - restoring state', () => {
    let webSocketFirst: WebSocket;
    let playerIdFirst: string;
    let webSocketSecond: WebSocket;
    let playerIdSecond: string;
    let physics: Physics;
    let isFirstPlayerBanning: boolean;
    let maps: string[];

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

    it('should get answer on JOIN_QUEUE: second player', (done) => {
        webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
            done();
        };

        const message: JoinQueueMessageInterface = {
            playerId: playerIdSecond,
            action: DuelWebsocketClientActions.JOIN_QUEUE,
            payload: {
                physics,
            },
        };

        webSocketSecond.send(JSON.stringify(message));
    });

    it('should get both players PICKBAN_STEPS', (done) => {
        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    const parsedMessage: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                    isFirstPlayerBanning = parsedMessage.payload.match.isFirstPlayerBanning;
                    maps = parsedMessage.payload.match.maps.map(({ name }: PickbanMapServerInterface) => name);

                    expect(parsedMessage).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('should restore state correctly', (done) => {
        webSocketFirst.close();

        webSocketFirst = new WebSocket('ws://localhost:3000/1v1');

        webSocketFirst.onopen = () => {
            const message: GetPlayerStateMessageInterface = { playerId: playerIdFirst, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

            webSocketFirst.send(JSON.stringify(message));
        };

        webSocketFirst.onmessage = (serverMessage) => {
            const matchMock: MatchInterface = { ...pickbanStepMock(playerIdFirst, playerIdSecond, physics).payload.match, timer: expect.any(Number) };

            expect(JSON.parse(serverMessage.data)).toMatchObject({ action: DuelWebsocketServerActions.PLAYER_STATE, payload: { match: matchMock } });

            done();
        };
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
    });
});
