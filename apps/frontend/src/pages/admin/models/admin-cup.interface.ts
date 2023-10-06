import { CupTypes, Physics } from '@dfcomps/contracts';

export interface AdminCupInterface {
  id: string;
  fullName: string;
  duration: string;
  physics: Physics | 'mixed';
  type: CupTypes;
  validationAvailable: boolean;
}
