import { CupTypes } from '../cup/cup-types.enum';
import { Physics } from '../global/physics.enum';

export interface AdminCupInterface {
  id: number;
  fullName: string;
  duration: string;
  physics: Physics | 'mixed';
  type: CupTypes;
  validationAvailable: boolean;
  calculateRatingsAvailable: boolean;
  endDateTime: string;
  hasTwoServers: boolean;
  isFinishAvailable: boolean;
}
