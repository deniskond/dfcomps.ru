import { DuelWebsocketClientActions } from './../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketClientMessageInterface } from './duel-websocket-client-message.interface';

export interface GetPlayerStateMessageInterface extends DuelWebsocketClientMessageInterface {
    action: DuelWebsocketClientActions.GET_PLAYER_STATE;
}
