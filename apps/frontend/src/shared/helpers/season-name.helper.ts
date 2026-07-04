const NAMED_SEASONS_START = 10;
const NAMED_SEASONS_BASE_YEAR = 2025;

export function getSeasonName(season: number): string | null {
  if (season < NAMED_SEASONS_START) {
    return null;
  }

  const offset = season - NAMED_SEASONS_START;
  const term = offset % 2 === 0 ? 'Summer' : 'Winter';
  const year = NAMED_SEASONS_BASE_YEAR + Math.ceil(offset / 2);

  return `${year} ${term}`;
}
