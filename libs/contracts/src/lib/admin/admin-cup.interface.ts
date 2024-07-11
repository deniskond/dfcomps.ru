import { CupStates } from '../cup/cup-states.enum';
import { CupTypes } from '../cup/cup-types.enum';
import { Physics } from '../global/physics.enum';

export interface AdminCupInterface {
  id: number;
  fullName: string;
  duration: string;
  physics: Physics | 'mixed';
  type: CupTypes;
  endDateTime: string;
  hasTwoServers: boolean;
  state: CupStates;
}
