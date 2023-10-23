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
  }[];
}

export interface AdminValidationInterface {
  vq3Demos: AdminPlayerDemosValidationInterface[];
  cpmDemos: AdminPlayerDemosValidationInterface[];
  cupInfo: {
    id: number;
    fullName: string;
  };
}
