import { Physics } from './../../../../enums/physics.enum';
import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';
import { MatchStates } from '../enums/match-states.enum';
import { MatchInterface } from './match.interface';

export interface PlayerStateMessageInterface extends DuelWebsocketServerMessageInterface {
  action: DuelWebsocketServerActions.PLAYER_STATE;
  payload: {
    state: MatchStates;
    physics?: Physics;
    match?: MatchInterface;
  };
}
