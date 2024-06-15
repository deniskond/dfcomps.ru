import { Subject } from 'rxjs';
import { RoundView, CompetitionView, Brackets } from './views.interface';

export interface UserCreds {
  login: string;
  userId: number;
}

export interface RoundData {
  view: RoundView;
  players: { userId?: number; token: string }[];
  competitionId: string;
  round: number;
}

export interface RoundProgress {
  stage: 'Warmup' | 'Ready' | 'Finished' | 'Disqualified' | 'Running';
  currentMap: number;
  progress: number;
}

export interface UpdateMessage {
  id: string;
  adminData?: Record<number, { userId?: number; token?: string }[]>;
  roundUpdate?: Record<number, RoundView | null>;
  bracketUpdate?: Brackets;
  currentRound?: {
    roundId: number;
    index: number;
  };
}

export interface CompetitionData {
  view: CompetitionView;
  rounds: Record<number, RoundData>;
  stream: Subject<UpdateMessage>;
  adminToken: string;
  lastProgressRequest?: {
    roundId: number;
    time: number;
    progress: Record<string, RoundProgress>;
  };
}

export enum UserRoles {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  VALIDATOR = 'VALIDATOR',
  NEWSMAKER = 'NEWSMAKER',
  CUP_ORGANIZER = 'CUP_ORGANIZER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
  STREAMER = 'STREAMER',
  WARCUP_ADMIN = 'WARCUP_ADMIN',
}

export type UserRole =
  | 'USER'
  | 'MODERATOR'
  | 'VALIDATOR'
  | 'NEWSMAKER'
  | 'CUP_ORGANIZER'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'STREAMER'
  | 'WARCUP_ADMIN';

export interface UserAccessInterface {
  login: string | null;
  userId: number | null;
  roles: UserRole[];
}

export interface AuthorizedUserAccessInterface {
  login: string;
  userId: number;
  roles: UserRole[];
}

export type CupOrganizerUserAccessInterface = AuthorizedUserAccessInterface;

export interface ProfileMainInfoInterface {
  avatar: string | null;
  nick: string;
  vq3Rating: number;
  cpmRating: number;
  country: string | null;
}

export interface ProfileInterface {
  player: ProfileMainInfoInterface;
}
