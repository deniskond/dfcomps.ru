import { MatchInterface } from './match.interface';

export interface ServerMatchInterface extends MatchInterface {
  timerStartTime: number;
  bannedMapsCount: number;
}
