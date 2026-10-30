import { AnticheatPlayerDisplayInterface } from './anticheat-player-display.interface';

export interface AnticheatPlayerScoresInterface {
  scores: {
    playerId: number;
    display: AnticheatPlayerDisplayInterface | null;
  }[];
}
