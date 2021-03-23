import faker from 'faker';
import { combineLatest, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { DuelServerMessageType } from '../types/duel-server-message.type';

describe('end-to-end: case 3 - double browser page', () => {
    let webSocketFirst: WebSocket;
    let playerId: string;
    let webSocketSecond: WebSocket;
    const webSocketFirstMessagesStream$: Subject<DuelServerMessageType> = new Subject();
    const webSocketSecondMessagesStream$: Subject<DuelServerMessageType> = new Subject();

    beforeAll(() => {
        webSocketFirst = new WebSocket('ws://localhost:3000/1v1');
        playerId = faker.random.uuid();
        webSocketSecond = new WebSocket('ws://localhost:3000/1v1');

        webSocketFirst.onmessage = (message: MessageEvent) => {
            const parsedMessage: DuelServerMessageType = JSON.parse(message.data);

            if (parsedMessage.action !== DuelWebsocketServerActions.QUEUE_INFO) {
                webSocketFirstMessagesStream$.next(parsedMessage);
            }
        };

        webSocketSecond.onmessage = (message: MessageEvent) => {
            const parsedMessage: DuelServerMessageType = JSON.parse(message.data);

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

    it('should get PLAYER_STATE on first correct message', (done) => {
        webSocketFirstMessagesStream$.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
            expect(message).toEqual({ action: DuelWebsocketServerActions.PLAYER_STATE, payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        });

        webSocketFirst.send(JSON.stringify({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    it('should get DUPLICATE_CLIENT on two sockets open and correct answer on second', (done) => {
        combineLatest([webSocketFirstMessagesStream$, webSocketSecondMessagesStream$]).pipe(take(1)).subscribe((messages: DuelServerMessageType[]) => {
            expect(messages[0]).toEqual({ action: DuelWebsocketServerActions.DUPLICATE_CLIENT });
            expect(messages[1]).toEqual({ action: DuelWebsocketServerActions.PLAYER_STATE, payload: { state: 'WAITING_FOR_QUEUE' } });
            done();
        });

        webSocketSecond.send(JSON.stringify({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE }));
    });

    afterAll(() => {
        webSocketFirst.close();
        webSocketSecond.close();
    });
});
