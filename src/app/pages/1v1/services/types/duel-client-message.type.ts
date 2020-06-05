import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { LeaveQueueMessageInterface } from '../interfaces/leave-queue-message.interface';

export type DuelClientMessage = JoinQueueMessageInterface | GetPlayerStateMessageInterface | LeaveQueueMessageInterface;
