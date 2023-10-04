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
import { DuelServerMessageType } from '../types/duel-server-message.type';
import { combineLatest, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { MapInterface } from '../interfaces/map.interface';
import { WebSocket, MessageEvent } from 'ws';

describe('end-to-end: case 2 - full match', () => {
  let webSocketFirst: WebSocket;
  let playerIdFirst: string;
  let webSocketSecond: WebSocket;
  let playerIdSecond: string;
  let physics: Physics;
  let isFirstPlayerBanning: boolean;
  let maps: MapInterface[];
  const webSocketFirstMessagesStream$: Subject<DuelServerMessageType> = new Subject();
  const webSocketSecondMessagesStream$: Subject<DuelServerMessageType> = new Subject();

  beforeAll(() => {
    webSocketFirst = new WebSocket('ws://localhost:4002/1v1');
    playerIdFirst = faker.datatype.uuid();
    webSocketSecond = new WebSocket('ws://localhost:4002/1v1');
    playerIdSecond = faker.datatype.uuid();
    physics = faker.random.arrayElement([Physics.VQ3, Physics.CPM]);

    webSocketFirst.onmessage = (message: MessageEvent) => {
      const parsedMessage: DuelServerMessageType = JSON.parse(message.data as string);

      if (parsedMessage.action !== DuelWebsocketServerActions.QUEUE_INFO) {
        webSocketFirstMessagesStream$.next(parsedMessage);
      }
    };

    webSocketSecond.onmessage = (message: MessageEvent) => {
      const parsedMessage: DuelServerMessageType = JSON.parse(message.data as string);

      if (parsedMessage.action !== DuelWebsocketServerActions.QUEUE_INFO) {
        webSocketSecondMessagesStream$.next(parsedMessage);
      }
    };

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
    webSocketFirstMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
      done();
    });

    const message: GetPlayerStateMessageInterface = {
      playerId: playerIdFirst,
      action: DuelWebsocketClientActions.GET_PLAYER_STATE,
    };

    webSocketFirst.send(JSON.stringify(message));
  });

  it('should get answer on GET_PLAYER_STATE: second player', (done) => {
    webSocketSecondMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
      done();
    });

    const message: GetPlayerStateMessageInterface = {
      playerId: playerIdSecond,
      action: DuelWebsocketClientActions.GET_PLAYER_STATE,
    };

    webSocketSecond.send(JSON.stringify(message));
  });

  it('should get answer on JOIN_QUEUE: first player', (done) => {
    webSocketFirstMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
      done();
    });

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
    webSocketSecondMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
      done();
    });

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
    combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$])
      .pipe(take(1))
      .subscribe((messages: DuelServerMessageType[]) => {
        isFirstPlayerBanning = (messages[0] as PickbanStepMessageInterface).payload.match.isFirstPlayerBanning;
        maps = (messages[0] as PickbanStepMessageInterface).payload.match.maps.map(
          ({ map }: PickbanMapServerInterface) => map,
        );

        expect(messages[0]).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
        expect(messages[1]).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
        done();
      });
  });

  it('should send PICKBAN_STEPS to both players after first ban', (done) => {
    let message: BanMapMessageInterface;
    let bannedByFirst: boolean[];
    let bannedBySecond: boolean[];

    combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$])
      .pipe(take(1))
      .subscribe((messages: DuelServerMessageType[]) => {
        expect(messages[0]).toMatchObject(
          pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
        );
        expect(messages[1]).toMatchObject(
          pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
        );
        done();
      });

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
  });

  it('should send PICKBAN_STEPS to both players after second ban', (done) => {
    let message: BanMapMessageInterface;
    let bannedByFirst: boolean[];
    let bannedBySecond: boolean[];

    combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$])
      .pipe(take(1))
      .subscribe((messages: DuelServerMessageType[]) => {
        expect(messages[0]).toMatchObject(
          pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
        );
        expect(messages[1]).toMatchObject(
          pickbanStepMock(playerIdFirst, playerIdSecond, physics, maps, bannedByFirst, bannedBySecond),
        );
        done();
      });

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
  });

  it('should not be able to join queue while in match', (done) => {
    webSocketFirstMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_FAILURE', payload: { error: 'Already in queue' } });
      done();
    });

    const message: JoinQueueMessageInterface = {
      playerId: playerIdFirst,
      action: DuelWebsocketClientActions.JOIN_QUEUE,
      payload: {
        physics,
      },
    };

    webSocketFirst.send(JSON.stringify(message));
  });

  it('should auto-ban a map if there is no response from player (3rd ban)', (done) => {
    combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$])
      .pipe(take(1))
      .subscribe((messages: DuelServerMessageType[]) => {
        expect(
          (messages[0] as PickbanStepMessageInterface).payload.match.maps.filter(
            (map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer,
          ).length,
        ).toEqual(3);

        expect(
          (messages[1] as PickbanStepMessageInterface).payload.match.maps.filter(
            (map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer,
          ).length,
        ).toEqual(3);

        done();
      });
  });

  it('should auto-ban a map if there is no response from player (4th ban)', (done) => {
    combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$])
      .pipe(take(1))
      .subscribe((messages: DuelServerMessageType[]) => {
        expect(
          (messages[0] as PickbanStepMessageInterface).payload.match.maps.filter(
            (map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer,
          ).length,
        ).toEqual(4);

        expect(
          (messages[1] as PickbanStepMessageInterface).payload.match.maps.filter(
            (map: PickbanMapServerInterface) => map.isBannedByFirstPlayer || map.isBannedBySecondPlayer,
          ).length,
        ).toEqual(4);

        done();
      });
  });

  it('both players should receive MATCH_FINISHED message', (done) => {
    combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$])
      .pipe(take(1))
      .subscribe((messages: DuelServerMessageType[]) => {
        expect(messages[0] as PickbanStepMessageInterface).toEqual({
          action: DuelWebsocketServerActions.MATCH_FINISHED,
        });
        expect(messages[1] as PickbanStepMessageInterface).toEqual({
          action: DuelWebsocketServerActions.MATCH_FINISHED,
        });
        done();
      });
  });

  it('player should NOT be able to join queue until match result is accepted', (done) => {
    webSocketFirstMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_FAILURE', payload: expect.any(Object) });
      done();
    });

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
    webSocketFirstMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
      done();
    });

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
