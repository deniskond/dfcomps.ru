import { NewsInterface } from './news.interface';
import { NewsTypes } from '../../../enums/news-types.enum';

export interface NewsSimpleInterface extends NewsInterface {
  type: NewsTypes.SIMPLE;
}
