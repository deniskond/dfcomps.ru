import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';

export interface MatchFinishedMessageInterface extends DuelWebsocketServerMessageInterface {
    action: DuelWebsocketServerActions.MATCH_FINISHED;
}
