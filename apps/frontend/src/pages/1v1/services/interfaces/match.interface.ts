import { Physics } from '@dfcomps/contracts';
import { PickbanMapServerInterface } from './pickban-map-server.interface';

export interface MatchInterface {
  firstPlayerId: string;
  secondPlayerId: string;
  isFirstPlayerBanning: boolean;
  isSecondPlayerBanning: boolean;
  maps: PickbanMapServerInterface[];
  physics: Physics;
  timer: number;
}
