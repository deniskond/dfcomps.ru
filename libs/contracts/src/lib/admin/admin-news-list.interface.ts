import { NewsTypes } from '@dfcomps/contracts';

export interface AdminNewsListInterface {
  id: number;
  headerRussian: string;
  headerEnglish: string;
  textRussian: string;
  textEnglish: string;
  typeName: string;
  date: string;
  type: NewsTypes;
}
