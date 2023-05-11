import { DuelWebsocketServerActions } from '../enums/duel-websocket-server-actions.enum';
import { DuelWebsocketServerMessageInterface } from './duel-websocket-server-message.interface';
import { QueueInfoInterface } from './queue-info.interface';

export interface QueueInfoMessageInterface extends DuelWebsocketServerMessageInterface {
  action: DuelWebsocketServerActions.QUEUE_INFO;
  payload: QueueInfoInterface;
}
