import { Physics } from '../global/physics.enum';

export interface AdminEditCupInterface {
  id: number;
  fullName: string;
  shortName: string;
  startTime: string;
  endTime: string;
  mapType: 'ws' | 'custom';
  mapName: string;
  mapPk3: string;
  mapLevelshot: string;
  author: string;
  weapons: string;
  multicupId: number | null;
  size: string;
  addNews: boolean;
  useTwoServers: boolean;
  server1: string;
  server2: string;
  physics: Physics | 'mixed';
  maps: (string | null)[];
  currentRound: number;
}
