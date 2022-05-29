import { NewsTypes } from '../../../app/enums/news-types.enum';

export interface AdminNewsInterface {
  id: string;
  headerRussian: string;
  headerEnglish: string;
  textRussian: string;
  textEnglish: string;
  typeName: string;
  date: string;
  type: NewsTypes;
}
