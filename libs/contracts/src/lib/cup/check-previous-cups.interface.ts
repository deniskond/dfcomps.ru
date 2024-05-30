export type CheckPreviousCupsInterface =
  | {
      wasOnCompetition: true;
      lastCompetition: string;
    }
  | {
      wasOnCompetition: false;
      lastCompetition: null;
    };
