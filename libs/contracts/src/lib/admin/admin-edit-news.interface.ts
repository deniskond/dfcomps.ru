import { NewsStreamInterface } from '../news';
import { NewsTypes } from '../news/news-types.enum';
import { AdminActiveCupInterface } from './admin-active-cup.interface';

export interface AdminEditNewsInterface {
  newsItem: {
    headerRussian: string;
    headerEnglish: string;
    textRussian: string | null;
    textEnglish: string | null;
    typeName: string;
    date: string;
    type: NewsTypes;
    cup: AdminActiveCupInterface | null;
    multicupId: number | null;
    imageLink: string | null;
    streams: NewsStreamInterface[];
  };
}
