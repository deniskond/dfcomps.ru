export interface AdminEditOfflineCupInterface {
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
}
