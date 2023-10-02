import { Physics } from "@dfcomps/contracts";
import { CupTypes } from "~shared/enums/cup-types.enum";

export interface AdminCupInterface {
  id: string;
  fullName: string;
  duration: string;
  physics: Physics | 'mixed';
  type: CupTypes;
  validationAvailable: boolean;
}
