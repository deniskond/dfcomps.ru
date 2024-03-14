export function getTablePlacesWithExclude(results: number[], exclude: boolean[]): (number | null)[] {
    let place = 1;
    let isStart = true;
  
    return results.map((_result: number, index: number) => {
      if (exclude[index]) {
        return null;
      }

      if (isStart) {
        isStart = false;

        return place;
      }

      let previousResultIndex = index - 1;

      while (previousResultIndex >= 0 && results[previousResultIndex] === null) {
        previousResultIndex--;
      }
  
      if (results[previousResultIndex] !== results[index]) {
        place++;
      }
  
      return place;
    });
  }
  