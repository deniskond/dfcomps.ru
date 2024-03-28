import { NewsTypes } from '../news/news-types.enum';

export interface AdminEditNewsInterface {
  newsItem: {
    headerRussian: string;
    headerEnglish: string;
    textRussian: string | null;
    textEnglish: string | null;
    typeName: string;
    date: string;
    type: NewsTypes;
    youtube: string | null;
    cupId: number | null;
  };
}
