import { AdminPlayerDemosValidationInterface } from './admin-player-demos-validation.interface';

export interface AdminValidationInterface {
  vq3Demos: AdminPlayerDemosValidationInterface[];
  cpmDemos: AdminPlayerDemosValidationInterface[];
  cupInfo: {
    id: number;
    fullName: string;
  };
}
