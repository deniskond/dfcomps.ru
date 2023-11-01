
import { ResultsTableInterface } from '../tables/results-table.interface';
import { NewsTypes } from './news-types.enum';
import { NewsInterface } from './news.interface';
import { CupInterface } from '@dfcomps/contracts';

export interface NewsOfflineResultsInterface extends NewsInterface {
  type: NewsTypes.OFFLINE_RESULTS;
  cpmResults: ResultsTableInterface;
  vq3Results: ResultsTableInterface;
  cup: CupInterface;
  levelshot: string;
}
