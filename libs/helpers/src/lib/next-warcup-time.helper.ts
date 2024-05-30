import * as moment from 'moment';

// timezone is set to Europe/Moscow by default in main.ts
const MSK_HOURS_WARCUP_START = 22;
const MSK_MINUTES_WARCUP_START = 30;
const SATURDAY_WEEK_NUMBER = 6;

export function getNextWarcupTime(): string | number {
  const currentMoment = moment();
  let nextSaturday: moment.Moment;

  if (currentMoment.day() === SATURDAY_WEEK_NUMBER) {
    if (currentMoment.hour() >= MSK_HOURS_WARCUP_START && currentMoment.minutes() >= MSK_MINUTES_WARCUP_START) {
      nextSaturday = currentMoment.add(1, 'week');
    } else {
      nextSaturday = currentMoment;
    }
  } else {
    nextSaturday = currentMoment.day(SATURDAY_WEEK_NUMBER);
  }

  return nextSaturday
    .startOf('day')
    .add(MSK_HOURS_WARCUP_START, 'hours')
    .add(MSK_MINUTES_WARCUP_START, 'minutes')
    .format();
}
