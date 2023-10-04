import { Physics } from '@dfcomps/contracts';

export interface CupInterface {
  archiveLink: string;
  bonusRating: number;
  currentRound: number;
  demosValidated: boolean;
  startDateTime: string;
  endDateTime: string;
  fullName: string;
  id: number;
  map1: string;
  map2: string;
  map3: string;
  map4: string;
  map5: string;
  mapAuthor: string;
  mapPk3: string;
  mapSize: string;
  mapWeapons: string;
  multicupId: number;
  physics: Physics;
  ratingCalculated: boolean;
  server: string;
  shortName: string;
  system: string;
  timer: boolean;
  twitch: string;
  type: string;
  useTwoServers: string;
  youtube: string;
  newsId: string | null;
  customMap: string | null;
  customNews: string | null;
  cupId: number | null;
}
