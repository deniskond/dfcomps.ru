import { VerifiedStatuses } from '../cup/verified-statuses.enum';

export interface AdminPlayerDemosValidationInterface {
  nick: string;
  country: string | null;
  demos: {
    time: number;
    validationStatus: VerifiedStatuses;
    validationFailedReason: string | null;
    demoLink: string;
    id: number;
    isOrganizer: boolean;
    isOutsideCompetition: boolean;
    isImpressive: boolean;
  }[];
}
