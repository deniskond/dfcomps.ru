import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';
import { MatchInterface } from './match.interface';

export interface PickbanStepMessageInterface extends DuelWebsocketServerMessageInterface {
  action: DuelWebsocketServerActions.PICKBAN_STEP;
  payload: {
    match: MatchInterface;
  };
}
