import { Physics } from '../global/physics.enum';
import { MulticupRoundResultInterface } from './multicup-round-result.interface';

export interface MulticupRoundInterface {
  fullName: string;
  map: string;
  levelshot: string;
  resultsTable: MulticupRoundResultInterface[];
  physics: Physics;
  hasPoints: boolean;
  shortName?: string;
}
