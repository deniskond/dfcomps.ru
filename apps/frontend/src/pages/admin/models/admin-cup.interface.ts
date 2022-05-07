import { CupTypes } from '../../../app/enums/cup-types.enum';
import { Physics } from '../../../app/enums/physics.enum';

export interface AdminCupInterface {
  id: string;
  fullName: string;
  duration: string;
  physics: Physics | 'mixed';
  type: CupTypes;
  validationAvailable: boolean;
}
