import { VerifiedStatuses } from '../cup/verified-statuses.enum';

export interface ValidationResultInterface {
  id: number;
  validationStatus: VerifiedStatuses;
  reason: string | null;
  isOrganizer: boolean;
  isOutsideCompetition: boolean;
  isImpressive: boolean;
}
