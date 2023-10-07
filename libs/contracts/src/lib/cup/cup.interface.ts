import { CupTypes, Physics } from '@dfcomps/contracts';

export interface CupInterface {
  archiveLink: string;
  bonusRating: number;
  currentRound: number;
  demosValidated: boolean;
  startDateTime: string;
  endDateTime: string;
  fullName: string;
  id: number;
  map1: string | null;
  map2: string;
  map3: string;
  map4: string;
  map5: string;
  mapAuthor: string | null;
  mapPk3: string | null;
  mapSize: string | null;
  mapWeapons: string | null;
  multicupId: number | null;
  physics: Physics;
  ratingCalculated: boolean;
  server: string | null;
  shortName: string;
  system: string;
  timer: boolean;
  twitch: string;
  type: CupTypes;
  useTwoServers: boolean;
  youtube: string;
  newsId: number | null;
  customMap: string | null;
  customNews: string | null;
  cupId: number | null;
}
