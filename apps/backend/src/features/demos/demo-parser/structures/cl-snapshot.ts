import { Q3Const } from '../const/q3-const';
import { PlayerState } from './player-state';

export class CLSnapshot {
  serverCommandNum: number = 0;
  serverTime: number = 0;
  messageNum: number = 0;
  deltaNum: number = -1;
  snapFlags: number = 0;
  valid: boolean = false;
  ping: number = 0;
  areamask: number[] = new Array(Q3Const.MAX_MAP_AREA_BYTES).fill(0);
  ps: PlayerState = new PlayerState();
  parseEntitiesNum: number = 0;
  numEntities: number = 0;
}
