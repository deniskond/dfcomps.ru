import { MulticupResultInterface } from '../../../pages/cup/interfaces/multicup-result.interface';
import { NewsTypes } from '../../../enums/news-types.enum';
import { NewsInterface } from './news.interface';
import { MulticupInterface } from '../../../interfaces/multicup.interface';

export interface NewsMulticupResultsInterface extends NewsInterface {
  type: NewsTypes.MULTICUP_RESULTS;
  multicup: MulticupInterface;
  cpmResults: MulticupResultInterface[];
  vq3Results: MulticupResultInterface[];
}
