import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import * as faker from 'faker';
import { Physics } from '../../enums/physics.enum';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { PickbanStepMessageInterface } from '../interfaces/pickban-step-message.interface';
import { pickbanStepMock } from './mocks/pickban-step.mock';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { QueueInfoMessageInterface } from '../interfaces/queue-info-message.interface';
import { PickbanMapServerInterface } from '../interfaces/pickban-map-server.interface';
import { BanMapMessageInterface } from '../interfaces/ban-map-message.interface';
import { LeaveQueueMessageInterface } from '../interfaces/leave-queue-message.interface';
import { MapInterface } from '../interfaces/map.interface';

describe('end-to-end: case 5 - sending queue info to all players', () => {
    let webSocketFirst: WebSocket;
    let playerIdFirst: string;
    let webSocketSecond: WebSocket;
    let playerIdSecond: string;
    let webSocketThird: WebSocket;
    let playerIdThird: string;
    let physics: Physics;
    let isFirstPlayerBanning: boolean;
    let maps: MapInterface[];

    const initialQueueStateMessage: QueueInfoMessageInterface = {
        action: DuelWebsocketServerActions.QUEUE_INFO,
        payload: {
            cpmMatches: 0,
            cpmPlayersInQueue: 0,
            vq3Matches: 0,
            vq3PlayersInQueue: 0,
        },
    };

    beforeAll(() => {
        webSocketFirst = new WebSocket('ws://localhost:3000/1v1');
        playerIdFirst = faker.random.uuid();
        webSocketSecond = new WebSocket('ws://localhost:3000/1v1');
        playerIdSecond = faker.random.uuid();
        webSocketThird = new WebSocket('ws://localhost:3000/1v1');
        playerIdThird = faker.random.uuid();
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
            new Promise((resolve) => {
                webSocketThird.onopen = () => {
                    resolve(null);
                };
            }),
        ]);
    });

    it('should get answer on GET_PLAYER_STATE: first player with QUEUE_INFO', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });

            webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                expect(JSON.parse(serverMessage.data)).toEqual(initialQueueStateMessage);
                done();
            };
        };

        const message: GetPlayerStateMessageInterface = { playerId: playerIdFirst, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

        webSocketFirst.send(JSON.stringify(message));
    });

    it('should get answer on GET_PLAYER_STATE: second player with QUEUE_INFO', (done) => {
        webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
            
            webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                expect(JSON.parse(serverMessage.data)).toEqual(initialQueueStateMessage);
                done();
            };
        };

        const message: GetPlayerStateMessageInterface = { playerId: playerIdSecond, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

        webSocketSecond.send(JSON.stringify(message));
    });

    it('should get answer on GET_PLAYER_STATE: third player with QUEUE_INFO', (done) => {
        webSocketThird.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
            
            webSocketThird.onmessage = (serverMessage: MessageEvent) => {
                expect(JSON.parse(serverMessage.data)).toEqual(initialQueueStateMessage);
                done();
            };
        };

        const message: GetPlayerStateMessageInterface = { playerId: playerIdThird, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

        webSocketThird.send(JSON.stringify(message));
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

    it('all three players should get new queue info', (done) => {
        const queueInfoMessage: QueueInfoMessageInterface = {
            action: DuelWebsocketServerActions.QUEUE_INFO,
            payload: {
                cpmMatches: 0,
                cpmPlayersInQueue: physics === Physics.CPM ? 1 : 0,
                vq3Matches: 0,
                vq3PlayersInQueue: physics === Physics.VQ3 ? 1 : 0,
            },
        };

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketThird.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    it('should get answer on LEAVE_QUEUE: first player', (done) => {
        webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
            expect(JSON.parse(serverMessage.data)).toEqual({ action: 'LEAVE_QUEUE_SUCCESS' });
            done();
        };

        const message: LeaveQueueMessageInterface = {
            playerId: playerIdFirst,
            action: DuelWebsocketClientActions.LEAVE_QUEUE,
        };

        webSocketFirst.send(JSON.stringify(message));
    });

    it('all three players should get new queue info', (done) => {
        const queueInfoMessage: QueueInfoMessageInterface = {
            action: DuelWebsocketServerActions.QUEUE_INFO,
            payload: {
                cpmMatches: 0,
                cpmPlayersInQueue: 0,
                vq3Matches: 0,
                vq3PlayersInQueue: 0,
            },
        };

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketThird.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
        ]).then(() => done());
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

    it('all three players should get new queue info', (done) => {
        const queueInfoMessage: QueueInfoMessageInterface = {
            action: DuelWebsocketServerActions.QUEUE_INFO,
            payload: {
                cpmMatches: 0,
                cpmPlayersInQueue: physics === Physics.CPM ? 1 : 0,
                vq3Matches: 0,
                vq3PlayersInQueue: physics === Physics.VQ3 ? 1 : 0,
            },
        };

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                webSocketThird.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
        ]).then(() => done());
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

    it('all three players should get new queue info AND first two players should get PICKBAN_STEPS', (done) => {
        const queueInfoMessage: QueueInfoMessageInterface = {
            action: DuelWebsocketServerActions.QUEUE_INFO,
            payload: {
                cpmMatches: physics === Physics.CPM ? 1 : 0,
                cpmPlayersInQueue: 0,
                vq3Matches: physics === Physics.VQ3 ? 1 : 0,
                vq3PlayersInQueue: 0,
            },
        };

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);

                    webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                        const parsedMessage: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                        isFirstPlayerBanning = parsedMessage.payload.match.isFirstPlayerBanning;
                        maps = parsedMessage.payload.match.maps.map(({ map }: PickbanMapServerInterface) => map);

                        expect(parsedMessage).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
                        resolve(null);
                    };
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);

                    webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                        const parsedMessage: PickbanStepMessageInterface = JSON.parse(serverMessage.data);

                        expect(parsedMessage).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
                        resolve(null);
                    };
                };
            }),
            new Promise((resolve) => {
                webSocketThird.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
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
                    mapName: maps[0].name,
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
                    mapName: maps[0].name,
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
                    mapName: maps[1].name,
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
                    mapName: maps[1].name,
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

    it('both players should receive MATCH_FINISHED message AND all players should receive queue info update', (done) => {
        const queueInfoMessage: QueueInfoMessageInterface = {
            action: DuelWebsocketServerActions.QUEUE_INFO,
            payload: {
                cpmMatches: 0,
                cpmPlayersInQueue: 0,
                vq3Matches: 0,
                vq3PlayersInQueue: 0,
            },
        };

        Promise.all([
            new Promise((resolve) => {
                webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toEqual({ action: DuelWebsocketServerActions.MATCH_FINISHED });

                    webSocketFirst.onmessage = (serverMessage: MessageEvent) => {
                        expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                        resolve(null);
                    };
                };
            }),
            new Promise((resolve) => {
                webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toEqual({ action: DuelWebsocketServerActions.MATCH_FINISHED });

                    webSocketSecond.onmessage = (serverMessage: MessageEvent) => {
                        expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                        resolve(null);
                    };
                };
            }),
            new Promise((resolve) => {
                webSocketThird.onmessage = (serverMessage: MessageEvent) => {
                    expect(JSON.parse(serverMessage.data)).toMatchObject(queueInfoMessage);
                    resolve(null);
                };
            }),
        ]).then(() => done());
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
        webSocketThird.close();
    });
});
