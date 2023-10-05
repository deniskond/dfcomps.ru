import { NewsTypes } from '@dfcomps/contracts';

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
