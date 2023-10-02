import { Subject } from 'rxjs';
import { RoundView, CompetitionView } from './views.interface';

export interface RoundData {
  view: RoundView;
  stream: Subject<RoundView>;
  players: { token: string }[];
  competitionId: string;
  round: number;
}

export interface CompetitionData {
  view: CompetitionView;
  rounds: Record<number, RoundData>;
  adminToken: string;
}
