import { NewsInterface } from './news.interface';
import { NewsTypes } from './news-types.enum';
import { MulticupResultInterface } from './multicup-result.interface';
import { MulticupInterface } from './multicup.interface';

export interface NewsMulticupResultsInterface extends NewsInterface {
  type: NewsTypes.MULTICUP_RESULTS;
  multicup: MulticupInterface;
  cpmResults: MulticupResultInterface[];
  vq3Results: MulticupResultInterface[];
}
