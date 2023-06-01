export function getTablePlaces(results: number[]): number[] {
  let place = 1;

  return results.map((_result: number, index: number) => {
    if (index === 0) {
      return place;
    }

    if (results[index - 1] !== results[index]) {
      place = index + 1;
    }

    return place;
  });
}
