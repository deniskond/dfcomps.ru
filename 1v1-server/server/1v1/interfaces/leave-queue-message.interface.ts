import { DuelWebsocketClientActions } from './../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketClientMessageInterface } from './duel-websocket-client-message.interface';

export interface LeaveQueueMessageInterface extends DuelWebsocketClientMessageInterface {
    action: DuelWebsocketClientActions.LEAVE_QUEUE;
}
