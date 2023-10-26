import { CupTypes, Physics } from '@dfcomps/contracts';

export interface CupInterface {
  archiveLink: string | null;
  bonusRating: number;
  currentRound: number;
  demosValidated: boolean;
  startDateTime: string;
  endDateTime: string;
  fullName: string;
  id: number;
  map1: string | null;
  map2: string | null;
  map3: string | null;
  map4: string | null;
  map5: string | null;
  mapAuthor: string | null;
  mapPk3: string | null;
  mapSize: string | null;
  mapWeapons: string | null;
  multicupId: number | null;
  physics: Physics;
  ratingCalculated: boolean;
  server: string | null;
  shortName: string;
  system: string | null;
  timer: boolean;
  twitch: string | null;
  type: CupTypes;
  useTwoServers: boolean;
  youtube: string | null;
  newsId: number | null;
  customMap: string | null;
  customNews: string | null;
  cupId: number | null;
}
