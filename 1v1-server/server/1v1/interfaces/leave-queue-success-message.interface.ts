import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';

export interface LeaveQueueSuccessMessageInterface extends DuelWebsocketServerMessageInterface {
    action: DuelWebsocketServerActions.LEAVE_QUEUE_SUCCESS;
}
