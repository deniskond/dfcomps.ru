import { NewsTypes } from '../news/news-types.enum';

export interface AdminEditNewsInterface {
  newsItem: {
    headerRussian: string;
    headerEnglish: string;
    textRussian: string;
    textEnglish: string;
    typeName: string;
    date: string;
    type: NewsTypes;
    youtube: string | null;
  };
}
