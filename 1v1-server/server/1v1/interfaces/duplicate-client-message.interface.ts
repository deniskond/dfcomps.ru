import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';
import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';

export interface DuplicateClientMessageInterface extends DuelWebsocketServerMessageInterface {
    action: DuelWebsocketServerActions.DUPLICATE_CLIENT;
}
