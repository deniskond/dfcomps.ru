import { NewsTypes } from '@dfcomps/contracts';

export interface AdminNewsListInterface {
  id: number;
  headerRussian: string;
  headerEnglish: string;
  textRussian: string | null;
  textEnglish: string | null;
  typeName: string;
  date: string;
  type: NewsTypes;
}
