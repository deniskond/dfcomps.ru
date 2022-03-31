import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';

export interface DuelWebsocketServerMessageInterface {
  action: DuelWebsocketServerActions;
}
