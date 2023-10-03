import { OnlineCupResultInterface } from '../../../interfaces/online-cup-result.interface';
import { NewsTypes } from '../../../enums/news-types.enum';
import { NewsInterface } from './news.interface';
import { CupInterface } from '@dfcomps/contracts';

export interface NewsOnlineResultsInterface extends NewsInterface {
  type: NewsTypes.ONLINE_RESULTS;
  cup: CupInterface;
  results: OnlineCupResultInterface[];
}
