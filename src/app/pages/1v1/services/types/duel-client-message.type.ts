import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';

export type DuelClientMessage = JoinQueueMessageInterface | GetPlayerStateMessageInterface;
