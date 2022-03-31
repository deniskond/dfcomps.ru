import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';

export interface JoinQueueFailureMessageInterface extends DuelWebsocketServerMessageInterface {
  action: DuelWebsocketServerActions.JOIN_QUEUE_FAILURE;
  payload: {
    error: string;
  };
}
