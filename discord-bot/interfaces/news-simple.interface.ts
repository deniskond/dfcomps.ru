import { NewsTypes } from './news-types.enum';
import { NewsInterface } from './news.interface';

export interface NewsSimpleInterface extends NewsInterface {
    type: NewsTypes.SIMPLE;
}