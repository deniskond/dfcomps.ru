import { DuelWebsocketServerActions } from './../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';

export interface OpponentFoundMessageInterface extends DuelWebsocketServerMessageInterface {
    action: DuelWebsocketServerActions.OPPONENT_FOUND;
    payload: {
        opponentId: string;
        opponentIsBanning: boolean;
    }
}
