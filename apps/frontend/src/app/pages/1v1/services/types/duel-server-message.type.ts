import { MatchFinishedMessageInterface } from '../interfaces/match-finished-message.interface';
import { JoinQueueFailureMessageInterface } from '../interfaces/join-queue-failure-message.interface';
import { JoinQueueSuccessMessageInterface } from '../interfaces/join-queue-success-message.interface';
import { PlayerStateMessageInterface } from '../interfaces/player-state-message.interface';
import { LeaveQueueSuccessMessageInterface } from '../interfaces/leave-queue-success-message.interface';
import { DuplicateClientMessageInterface } from '../interfaces/duplicate-client-message.interface';
import { PickbanStepMessageInterface } from '../interfaces/pickban-step-message.interface';
import { QueueInfoMessageInterface } from '../interfaces/queue-info-message.interface';

export type DuelServerMessageType =
  | JoinQueueFailureMessageInterface
  | JoinQueueSuccessMessageInterface
  | PlayerStateMessageInterface
  | LeaveQueueSuccessMessageInterface
  | PickbanStepMessageInterface
  | DuplicateClientMessageInterface
  | MatchFinishedMessageInterface
  | QueueInfoMessageInterface;
