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
import { stressTestNumberOfMatchesInEachPhysics } from '../constants/stress-test-clients-count';

const numberOfMatchesInEachPhysics = stressTestNumberOfMatchesInEachPhysics;
// for both physics two players are needed for one match
const numberOfClients = numberOfMatchesInEachPhysics * 4;

const playersIds: string[] = new Array(numberOfClients).fill(null).map(() => faker.random.uuid());
console.log(`Starting stress testing for ${numberOfClients} clients`);

// double check for same array of players; the idea is to test if server state is correct for the same players to join and play again
Promise.all(getClientsFunctionsBatch())
    .then(() => {
        console.log('First phase: success');
        console.log('Testing second time queue for each player');
        return Promise.all(getClientsFunctionsBatch());
    })
    .then(() => {
        console.log('\x1b[32m%s\x1b[0m', 'Stress test passed!');
        process.exit(0);
    });

function getClientsFunctionsBatch(): Promise<void>[] {
    return new Array(numberOfClients).fill(null).map(
        (_el, index) =>
            new Promise<void>((resolve) =>
                testClientActions(playersIds[index], index >= numberOfClients / 2 ? Physics.CPM : Physics.VQ3).then(() => resolve()),
            ),
    );
}

async function testClientActions(playerId: string, physics: Physics): Promise<void> {
    const webSocket = new WebSocket('ws://localhost:3000/1v1');
    const websocketMessages: Subject<DuelServerMessageType> = new Subject();

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

    await new Promise<void>((resolve) =>
        websocketMessages.pipe(take(1)).subscribe((message: DuelServerMessageType) => {
            if (message.action !== DuelWebsocketServerActions.MATCH_FINISHED) {
                throw new Error('Wrong answer on MATCH_RESULT_ACCEPTED: ' + JSON.stringify(message));
            }

            resolve();
        }),
    );

    const acceptMatchResultMessage: MatchResultAcceptedMessageInterface = {
        playerId,
        action: DuelWebsocketClientActions.MATCH_RESULT_ACCEPTED,
    };

    webSocket.send(JSON.stringify(acceptMatchResultMessage));
}
