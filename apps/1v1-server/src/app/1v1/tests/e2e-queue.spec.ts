import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import * as faker from 'faker';
import { Physics } from '../../enums/physics.enum';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { PickbanStepMessageInterface } from '../interfaces/pickban-step-message.interface';
import { DuelServerMessageType } from '../types/duel-server-message.type';
import { Subject } from 'rxjs';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { take } from 'rxjs/operators';
import { WebSocket, MessageEvent } from 'ws';

describe('end-to-end: case 1a - joining and leaving queue', () => {
  let webSocket: WebSocket;
  let playerId: string;
  let physics: Physics;
  const webSocketMessagesStream$: Subject<DuelServerMessageType> = new Subject();

  beforeAll(() => {
    webSocket = new WebSocket('ws://localhost:3000/1v1');
    playerId = faker.datatype.uuid();
    physics = faker.random.arrayElement([Physics.VQ3, Physics.CPM]);

    webSocket.onmessage = (message: MessageEvent) => {
      const parsedMessage: DuelServerMessageType = JSON.parse(message.data as string);

      if (parsedMessage.action !== DuelWebsocketServerActions.QUEUE_INFO) {
        webSocketMessagesStream$.next(parsedMessage);
      }
    };

    return new Promise((resolve) => {
      webSocket.onopen = () => {
        resolve(null);
      };
    });
  });

  it('should get answer on GET_PLAYER_STATE', (done) => {
    webSocketMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } });
      done();
    });

    webSocket.send(JSON.stringify({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
  });

  it('should get answer on JOIN_QUEUE', (done) => {
    webSocketMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });
      done();
    });

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
    webSocketMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_FAILURE', payload: { error: 'Already in queue' } });
      done();
    });

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
    webSocketMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'LEAVE_QUEUE_SUCCESS' });
      done();
    });

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
  const webSocketFirstMessagesStream$: Subject<DuelServerMessageType> = new Subject();
  const webSocketSecondMessagesStream$: Subject<DuelServerMessageType> = new Subject();

  beforeAll(() => {
    webSocketFirst = new WebSocket('ws://localhost:3000/1v1');
    playerIdFirst = faker.datatype.uuid();
    webSocketSecond = new WebSocket('ws://localhost:3000/1v1');
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

  it('should not find a match if first player left', (done) => {
    webSocketSecondMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
      expect(message).toEqual({ action: 'JOIN_QUEUE_SUCCESS' });

      webSocketSecondMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
        expect((message as PickbanStepMessageInterface).payload?.match?.firstPlayerId).not.toBe(playerIdFirst);
        expect((message as PickbanStepMessageInterface).payload?.match?.secondPlayerId).not.toBe(playerIdFirst);
      });

      setTimeout(() => {
        done();
      }, 3000);
    });

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
