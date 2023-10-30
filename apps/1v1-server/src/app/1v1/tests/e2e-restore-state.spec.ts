import * as faker from 'faker';
import { combineLatest, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Physics } from '../../enums/physics.enum';
import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { MatchInterface } from '../interfaces/match.interface';
import { DuelServerMessageType } from '../types/duel-server-message.type';
import { pickbanStepMock } from './mocks/pickban-step.mock';
import { WebSocket, MessageEvent } from 'ws';

describe('end-to-end: case 4 - restoring state', () => {
  let webSocketFirst: WebSocket;
  let playerIdFirst: any;
  let webSocketSecond: WebSocket;
  let playerIdSecond: any;
  let webSocketThird: WebSocket;
  let physics: Physics;
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
        expect(messages[0]).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
        expect(messages[1]).toMatchObject(pickbanStepMock(playerIdFirst, playerIdSecond, physics));
        done();
      });
  });

  it('should restore state correctly', (done) => {
    webSocketFirst.close();

    webSocketThird = new WebSocket('ws://localhost:4002/1v1');

    webSocketThird.onopen = () => {
      const message: GetPlayerStateMessageInterface = {
        playerId: playerIdFirst,
        action: DuelWebsocketClientActions.GET_PLAYER_STATE,
      };

      webSocketThird.send(JSON.stringify(message));
    };

    webSocketThird.onmessage = (serverMessage: MessageEvent) => {
      const parsedMessage = JSON.parse(serverMessage.data as string);

      if (parsedMessage.action === DuelWebsocketServerActions.QUEUE_INFO) {
        return;
      }

      const matchMock: MatchInterface = {
        ...pickbanStepMock(playerIdFirst, playerIdSecond, physics).payload.match,
        timer: expect.any(Number),
      };

      expect(parsedMessage).toMatchObject({
        action: DuelWebsocketServerActions.PLAYER_STATE,
        payload: { match: matchMock },
      });

      done();
    };
  });

  afterAll(() => {
    webSocketFirst.close();
    webSocketSecond.close();
    webSocketThird.close();
  });
});
