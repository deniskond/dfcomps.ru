import { DuelWebsocketClientActions } from './../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketClientMessageInterface } from './duel-websocket-client-message.interface';
import { Physics } from '../../../../enums/physics.enum';

export interface JoinQueueMessageInterface extends DuelWebsocketClientMessageInterface {
    action: DuelWebsocketClientActions.JOIN_QUEUE;
    payload: {
        physics: Physics;
    };
}
