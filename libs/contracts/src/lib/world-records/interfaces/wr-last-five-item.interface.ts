import { Physics } from '../../global/physics.enum';

export interface WrLastFiveItemInterface {
  map: string;
  time: number;
  physics: Physics;
  uploadedAt: string;
  playerId: number | null;
  playerNick: string | null;
  playerCountry: string | null;
}
