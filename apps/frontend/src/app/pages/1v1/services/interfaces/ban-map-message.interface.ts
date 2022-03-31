import { DuelWebsocketClientActions } from './../enums/duel-websocket-client-actions.enum';
import { DuelWebsocketClientMessageInterface } from './duel-websocket-client-message.interface';

export interface BanMapMessageInterface extends DuelWebsocketClientMessageInterface {
  action: DuelWebsocketClientActions.BAN_MAP;
  payload: {
    mapName: string;
  };
}
