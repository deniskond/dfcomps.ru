import { Physics } from '~shared/enums/physics.enum';
import { DuelWebsocketClientActions } from './../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketClientMessageInterface } from './duel-websocket-client-message.interface';

export interface JoinQueueMessageInterface extends DuelWebsocketClientMessageInterface {
  action: DuelWebsocketClientActions.JOIN_QUEUE;
  payload: {
    physics: Physics;
  };
}
