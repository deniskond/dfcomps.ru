import { Languages } from '@dfcomps/contracts';
import * as moment from 'moment';

export function formatCupTime(dateTime: string, language: Languages): string {
  language === Languages.EN ? moment.locale('en') : moment.locale('ru');

  return moment(dateTime).format('D MMM YYYY HH:mm').replace('.', '');
}
