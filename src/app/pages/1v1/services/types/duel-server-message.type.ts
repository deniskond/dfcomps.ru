import { JoinQueueFailureMessageInterface } from '../interfaces/join-queue-failure-message.interface';
import { JoinQueueSuccessMessageInterface } from '../interfaces/join-queue-success-message.interface';
import { PlayerStateMessageInterface } from '../interfaces/player-state-message.interface';
import { LeaveQueueSuccessMessageInterface } from '../interfaces/leave-queue-success-message.interface';

export type DuelServerMessageType =
    | JoinQueueFailureMessageInterface
    | JoinQueueSuccessMessageInterface
    | PlayerStateMessageInterface
    | LeaveQueueSuccessMessageInterface;
