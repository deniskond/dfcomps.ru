import { NewsTypes } from "./news-types.enum";
import { NewsInterface } from "./news.interface";

export interface NewsStreamersResultsInterface extends NewsInterface {
    type: NewsTypes.STREAMERS_RESULTS;
}