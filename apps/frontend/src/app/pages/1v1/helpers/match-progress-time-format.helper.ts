export function mapSecondsToFormattedTime(count: number): string {
  const minutes = Math.floor(count / 60);
  const seconds = count % 60;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

  return `${formattedMinutes}:${formattedSeconds}`;
}
