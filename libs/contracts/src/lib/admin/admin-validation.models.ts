export enum AdminDemoValidationStatuses {
  NOT_CHECKED,
  VALIDATED_OK,
  VALIDATED_FAILED,
}

export interface AdminPlayerDemosValidationInterface {
  nick: string;
  country: string;
  demos: {
    time: string;
    validationStatus: AdminDemoValidationStatuses;
    validationFailedReason: string;
    demoLink: string;
    id: string;
  }[];
}

export interface AdminValidationInterface {
  vq3Demos: AdminPlayerDemosValidationInterface[];
  cpmDemos: AdminPlayerDemosValidationInterface[];
  cupInfo: {
    id: string;
    fullName: string;
  };
}
