import * as moment from 'moment-timezone';

const MSK_HOURS_WARCUP_START = 19;
const MSK_MINUTES_WARCUP_START = 0;
const SATURDAY_WEEK_NUMBER = 6;

export function getNextWarcupTime(): string {
  const currentMoment = moment().tz('Europe/Moscow');
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
