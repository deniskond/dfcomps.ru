import { DuelWebsocketClientActions } from '../enums/duel-websocket-client-actions.enum';

export interface DuelWebsocketClientMessageInterface {
  playerId: number;
  action: DuelWebsocketClientActions;
}
