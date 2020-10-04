import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';

export interface JoinQueueSuccessMessageInterface extends DuelWebsocketServerMessageInterface {
    action: DuelWebsocketServerActions.JOIN_QUEUE_SUCCESS;
}
