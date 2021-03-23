import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';

export interface QueueInfoMessageInterface extends DuelWebsocketServerMessageInterface {
    action: DuelWebsocketServerActions.QUEUE_INFO;
    payload: {
        cpmMatches: number;
        cpmPlayersInQueue: number;
        vq3Matches: number;
        vq3PlayersInQueue: number;
    };
}
