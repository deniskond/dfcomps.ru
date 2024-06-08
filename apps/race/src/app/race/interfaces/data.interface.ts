import { Subject } from 'rxjs';
import { RoundView, CompetitionView } from './views.interface';

export interface RoundData {
  view: RoundView;
  stream: Subject<RoundView>;
  players: { token: string }[];
  competitionId: string;
  round: number;
}

export interface RoundProgress {
  stage: 'Warmup' | 'Ready' | 'Finished' | 'Disqualified' | 'Running';
  currentMap: number;
  progress: number;
}

export interface CompetitionData {
  view: CompetitionView;
  rounds: Record<number, RoundData>;
  adminToken: string;
  lastProgressRequest?: {
    roundId: number;
    time: number;
    progress: Record<string, RoundProgress>;
  };
}
