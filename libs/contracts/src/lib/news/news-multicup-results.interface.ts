import { MulticupResultInterface } from '../cup/multicup-result.interface';
import { MulticupInterface } from '../cup/multicup.interface';
import { NewsTypes } from './news-types.enum';
import { NewsInterface } from './news.interface';

export interface NewsMulticupResultsInterface extends NewsInterface {
  type: NewsTypes.MULTICUP_RESULTS;
  multicup: MulticupInterface;
  cpmResults: MulticupResultInterface[];
  vq3Results: MulticupResultInterface[];
}
