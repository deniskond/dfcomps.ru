import { CupTypes } from "~shared/enums/cup-types.enum";
import { Physics } from "~shared/enums/physics.enum";

export interface AdminCupInterface {
  id: string;
  fullName: string;
  duration: string;
  physics: Physics | 'mixed';
  type: CupTypes;
  validationAvailable: boolean;
}
