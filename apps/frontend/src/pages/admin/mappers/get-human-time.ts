import * as moment from 'moment-timezone';

export function getHumanTime(time: string): string {
  return moment(time).tz('Europe/Moscow').format('DD.MM.YYYY HH:mm') + ' MSK';
}
