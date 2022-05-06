export enum AdminDemoValidationStatus {
  NOT_CHECKED,
  VALIDATED_OK,
  VALIDATED_FAILED,
}

export interface PlayerDemosValidationInterface {
  nick: string;
  country: string;
  demos: {
    time: string;
    validationStatus: AdminDemoValidationStatus;
    validationFailedReason: string;
    demoLink: string;
  }[];
}

export interface AdminValidationInterface {
  vq3Demos: PlayerDemosValidationInterface[];
  cpmDemos: PlayerDemosValidationInterface[];
  cupInfo: {
    id: string;
    fullName: string;
  };
}
