import { Subject } from 'rxjs';
import { RoundView, CompetitionView } from './views.iterface';

export interface RoundData {
  view: RoundView;
  subscription: Subject<RoundView>;
  players: { token: string }[];
  competitionId: string;
  round: number;
}

export interface CompetitionData {
  view: CompetitionView;
  rounds: Record<number, RoundData>;
  adminToken: string;
}
