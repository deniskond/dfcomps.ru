import { CupInterface } from '../cup/cup.interface';
import { ResultsTableInterface } from '../tables/results-table.interface';
import { NewsTypes } from './news-types.enum';
import { NewsInterface } from './news.interface';

export interface NewsOfflineResultsInterface extends NewsInterface {
  type: NewsTypes.OFFLINE_RESULTS | NewsTypes.DFWC_ROUND_RESULTS;
  cpmResults: ResultsTableInterface;
  vq3Results: ResultsTableInterface;
  cup: CupInterface;
  levelshot: string;
  userVote: number | null;
  isVotingAvailable: boolean;
}
