import { CupInterface } from './cup.interface';
import { NewsTypes } from './news-types.enum';
import { NewsInterface } from './news.interface';
import { ResultsTableInterface } from './results-table.interface';

export interface NewsOfflineResultsInterface extends NewsInterface {
    type: NewsTypes.OFFLINE_RESULTS;
    cpmResults: ResultsTableInterface;
    vq3Results: ResultsTableInterface;
    cup: CupInterface;
    levelshot: string;
}
