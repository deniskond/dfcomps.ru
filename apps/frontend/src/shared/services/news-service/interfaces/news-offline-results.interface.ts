import { ResultsTableInterface } from '../../../interfaces/results-table.interface';
import { NewsInterface } from './news.interface';
import { NewsTypes } from '../../../enums/news-types.enum';
import { CupInterface } from '@dfcomps/contracts';

export interface NewsOfflineResultsInterface extends NewsInterface {
  type: NewsTypes.OFFLINE_RESULTS;
  cpmResults: ResultsTableInterface;
  vq3Results: ResultsTableInterface;
  cup: CupInterface;
  levelshot: string;
}
