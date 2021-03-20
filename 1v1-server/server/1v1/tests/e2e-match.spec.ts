import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import * as faker from 'faker';
import { Physics } from '../../enums/physics.enum';
import { pickbanStepMock } from './mocks/pickban-step.mock';
import { PickbanStepMessageInterface } from '../interfaces/pickban-step-message.interface';
import { PickbanMapServerInterface } from '../interfaces/pickban-map-server.interface';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { BanMapMessageInterface } from '../interfaces/ban-map-message.interface';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { MatchResultAcceptedMessageInterface } from '../interfaces/match-result-accepted-message.interface';

describe('end-to-end: case 2 - full match', function () {
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

    it('should send PICKBAN_STEPS to both players after first ban', (done) => {
        let message: BanMapMessageInterface;
        let bannedByFirst: boolean[];
        let bannedBySecond: boolean[];

        if (isFirstPlayerBanning) {
            message = {
                playerId: playerIdFirst,
                action: DuelWebsocketClientActions.BAN_MAP,
                payload: {
                    mapName: maps[0],
                },
            };

            bannedByFirst = [true, false, false, false, false];
            bannedBySecond = [false, false, false, false, false];
            webSocketFirst.send(JSON.stringify(message));
        } else {
            message = {
                playerId: playerIdSecond,
                action: DuelWebsocketClientActions.BAN_MAP,
                payload: {
                    mapName: maps[0],
                },
            };

            bannedByFirst = [false, false, false, false, false];
            bannedBySecond = [true, false, false, false, false];
            webSocketSecond.send(JSON.stringify(message));
        }

        isFirstPlayerBanning = !isFirstPlayerBanning;

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(
                        pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
                    );
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(
                        pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
                    );
                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('should send PICKBAN_STEPS to both players after second ban', (done) => {
        let message: BanMapMessageInterface;
        let bannedByFirst: boolean[];
        let bannedBySecond: boolean[];

        if (isFirstPlayerBanning) {
            message = {
                playerId: playerIdFirst,
                action: DuelWebsocketClientActions.BAN_MAP,
                payload: {
                    mapName: maps[1],
                },
            };

            bannedByFirst = [false, true, false, false, false];
            bannedBySecond = [true, false, false, false, false];
            webSocketFirst.send(JSON.stringify(message));
        } else {
            message = {
                playerId: playerIdSecond,
                action: DuelWebsocketClientActions.BAN_MAP,
                payload: {
                    mapName: maps[1],
                },
            };

            bannedByFirst = [true, false, false, false, false];
            bannedBySecond = [false, true, false, false, false];
            webSocketSecond.send(JSON.stringify(message));
        }

        isFirstPlayerBanning = !isFirstPlayerBanning;

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(
                        pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
                    );
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(
                        pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
                    );
                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('should auto-ban a map if there is no response from player (3rd ban)', (done) => {
        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    const pickbanSteps: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                    expect(
                        pickbanSteps.payload.match.maps.filter((map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer)
                            .length,
                    ).toEqual(3);

                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    const pickbanSteps: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                    expect(
                        pickbanSteps.payload.match.maps.filter((map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer)
                            .length,
                    ).toEqual(3);

                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('should auto-ban a map if there is no response from player (4th ban)', (done) => {
        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    const pickbanSteps: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                    expect(
                        pickbanSteps.payload.match.maps.filter((map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer)
                            .length,
                    ).toEqual(4);

                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    const pickbanSteps: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                    expect(
                        pickbanSteps.payload.match.maps.filter((map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer)
                            .length,
                    ).toEqual(4);

                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('both players should receive MATCH_FINISHED message', (done) => {
        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toEqual({ action: DuelWebsocketServerActions.MATCH_FINISHED });

                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toEqual({ action: DuelWebsocketServerActions.MATCH_FINISHED });

                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('player should not be able to join queue until match result is accepted', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_FAILURE', payload: expect.any(Object) });
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

    it('player should be able to join queue after match result is accepted', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
            done();
        };

        const joinQueueMessage: JoinQueueMessageInterface = {
            playerId: playerIdFirst,
            action: DuelWebsocketClientActions.JOIN_QUEUE,
            payload: {
                physics,
            },
        };

        const acceptMatchResultMessage: MatchResultAcceptedMessageInterface = {
            playerId: playerIdFirst,
            action: DuelWebsocketClientActions.MATCH_RESULT_ACCEPTED,
        };

        webSocketFirst.send(JSON.stringify(acceptMatchResultMessage));
        webSocketFirst.send(JSON.stringify(joinQueueMessage));
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
    });
});
