import { DuelWebsocketClientActions } from './../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketClientMessageInterface } from './duel-websocket-client-message.interface';

export interface MatchResultAcceptedMessageInterface extends DuelWebsocketClientMessageInterface {
  action: DuelWebsocketClientActions.MATCH_RESULT_ACCEPTED;
}
