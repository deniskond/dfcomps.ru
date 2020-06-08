import { MatchResultAcceptedMessageInterface } from './../interfaces/match-result-accepted-message.interface';
import { JoinQueueMessageInterface } from '../interfaces/join-queue-message.interface';
import { GetPlayerStateMessageInterface } from '../interfaces/get-player-state-message.interface';
import { LeaveQueueMessageInterface } from '../interfaces/leave-queue-message.interface';
import { BanMapMessageInterface } from '../interfaces/ban-map-message.interface';

export type DuelClientMessage =
    | JoinQueueMessageInterface
    | GetPlayerStateMessageInterface
    | LeaveQueueMessageInterface
    | BanMapMessageInterface
    | MatchResultAcceptedMessageInterface;
