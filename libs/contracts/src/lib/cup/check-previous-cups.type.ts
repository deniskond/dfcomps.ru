export type CheckPreviousCupsType =
  | {
      wasOnCompetition: true;
      lastCompetition: string;
    }
  | {
      wasOnCompetition: false;
      lastCompetition: null;
    };
