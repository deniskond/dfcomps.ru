import { Physics } from '../enums/physics.enum';

export interface CupInterface {
  archiveLink: string;
  bonusRating: string;
  currentRound: string;
  demosValidated: string;
  startDateTime: string;
  endDateTime: string;
  fullName: string;
  id: string;
  map1: string;
  map2: string;
  map3: string;
  map4: string;
  map5: string;
  mapAuthor: string;
  mapPk3: string;
  mapSize: string;
  mapWeapons: string;
  multicupId: string;
  physics: Physics;
  ratingCalculated: string;
  server: string;
  shortName: string;
  system: string;
  timer: string;
  twitch: string;
  type: string;
  useTwoServers: string;
  youtube: string;
  newsId?: string;
  customMap?: string;
  customNews?: string;
  cupId?: string;
}
