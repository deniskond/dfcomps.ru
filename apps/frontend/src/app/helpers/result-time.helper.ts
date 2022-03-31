export function formatResultTime(stringTime: string): string {
  let result = '';
  let time = parseFloat(stringTime);
  const minutes = Math.floor(time / 60);

  if (minutes !== 0) {
    result += `${minutes}:`;
  }

  time -= minutes * 60;

  let fraction = time - Math.floor(time);

  time = Math.floor(time);

  if (time < 10) {
    result += `0${time}`;
  } else {
    result += time;
  }

  fraction = Math.round(fraction * 1000);

  if (fraction !== 0) {
    if (fraction >= 100) {
      result += `:${fraction}`;
    } else if (fraction >= 10) {
      result += `:0${fraction}`;
    } else {
      result += `:00${fraction}`;
    }
  } else {
    result += ':000';
  }

  return result;
}
