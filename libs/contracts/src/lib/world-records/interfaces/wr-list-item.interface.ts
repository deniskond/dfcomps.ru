import { Physics } from '../../global/physics.enum';

export interface WrListItemInterface {
  map: string;
  time: number;
  physics: Physics;
  demoLink: string;
  uploadedAt: string;
  playerId: number | null;
  playerNick: string | null;
  playerCountry: string | null;
}
