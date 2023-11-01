import * as moment from 'moment-timezone';

export function getHumanTime(datetime: string): string {
  return moment(datetime).tz('Europe/Moscow').format('DD.MM.YYYY HH:mm') + ' MSK';
}
