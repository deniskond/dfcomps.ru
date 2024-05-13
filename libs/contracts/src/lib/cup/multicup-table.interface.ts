import { Physics } from '../global/physics.enum';
import { MulticupResultInterface } from './multicup-result.interface';
import { MulticupSystems } from './multicup-systems.enum';

export interface MulticupTableInterface {
  fullName: string;
  rounds: number;
  currentRound: number;
  physics: Physics;
  system: MulticupSystems;
  players: MulticupResultInterface[];
  shortName?: string;
}
