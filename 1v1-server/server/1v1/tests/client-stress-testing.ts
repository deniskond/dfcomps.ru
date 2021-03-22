import faker from 'faker';
import { Subject } from 'rxjs';
import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { DuelServerMessageType } from '../types/duel-server-message.type';
import WebSocket from 'ws';
import { take } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { Physics } from '../../enums/physics.enum';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { MatchResultAcceptedMessageInterface } from '../interfaces/match-result-accepted-message.interface';

const numberOfClients = 100;

for (let i = 0; i < numberOfClients; i++) {
    testClientActions();
}

async function testClientActions(): Promise<void> {
    const webSocket = new WebSocket('ws://localhost:3000/1v1');
    const playerId = faker.random.uuid();
    const websocketMessages: Subject<DuelServerMessageType> = new Subject();
    const physics: Physics = faker.random.arrayElement([Physics.VQ3, Physics.CPM]);

    await new Promise<void>((resolve) => {
        webSocket.addEventListener('open', () => resolve());
    });

    webSocket.onmessage = (message: any) => websocketMessages.next(JSON.parse(message.data));

    const getStateMessage: GetPlayerStateMessageInterface = { playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE };

    webSocket.send(JSON.stringify(getStateMessage));

    await new Promise<void>((resolve) =>
        websocketMessages.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
            if (!isEqual(message, { action: 'PLAYER_STATE', payload: { state: 'WAITING_FOR_QUEUE' } })) {
                throw new Error('Wrong answer on GET_PLAYER_STATE');
            }

            resolve();
        }),
    );

    const joinQueueMessage: JoinQueueMessageInterface = {
        playerId,
        action: DuelWebsocketClientActions.JOIN_QUEUE,
        payload: {
            physics,
        },
    };

    webSocket.send(JSON.stringify(joinQueueMessage));

    await new Promise<void>((resolve) =>
        websocketMessages.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
            if (!isEqual(message, { action: 'JOIN_QUEUE_SUCCESS' })) {
                throw new Error('Wrong answer on JOIN_QUEUE');
            }

            resolve();
        }),
    );

    await new Promise<void>((resolve) =>
        websocketMessages.pipe(take(5)).subscribe(
            (message: DuelServerMessageType) => {
                if (message.action !== DuelWebsocketServerActions.PICKBAN_STEP) {
                    throw new Error('Wrong answer on JOIN_QUEUE');
                }
            },
            () => {},
            () => {
                resolve();
            },
        ),
    );

    const acceptMatchResultMessage: MatchResultAcceptedMessageInterface = {
        playerId,
        action: DuelWebsocketClientActions.MATCH_RESULT_ACCEPTED,
    };

    webSocket.send(JSON.stringify(acceptMatchResultMessage));

    await new Promise<void>((resolve) =>
        websocketMessages.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
            if (message.action !== DuelWebsocketServerActions.MATCH_FINISHED) {
                throw new Error('Wrong answer on MATCH_RESULT_ACCEPTED: ' + JSON.stringify(message));
            }

            resolve();
        }),
    );
}
