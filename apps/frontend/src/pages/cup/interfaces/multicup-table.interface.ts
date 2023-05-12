import { CupSystems } from '~shared/enums/cup-systems.enum';
import { MulticupResultInterface } from './multicup-result.interface';
import { Physics } from '~shared/enums/physics.enum';

export interface MulticupTableInterface {
  fullName: string;
  rounds: string;
  currentRound: number;
  physics: Physics;
  system: CupSystems;
  players: MulticupResultInterface[];
  shortName?: string;
}
