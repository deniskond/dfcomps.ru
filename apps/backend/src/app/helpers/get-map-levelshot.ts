import * as fs from 'fs';

export function getMapLevelshot(mapname: string): string {
  return fs.existsSync(`./uploads/images/maps/${mapname}.jpg`)
    ? `./uploads/images/maps/${mapname}.jpg`
    : `https://ws.q3df.org/images/levelshots/512x384/${mapname}.jpg`;
}
