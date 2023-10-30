import { Physics } from '../../enums/physics.enum';
import { PickbanMapServerInterface } from './pickban-map-server.interface';

export interface MatchInterface {
  firstPlayerId: number;
  secondPlayerId: number;
  isFirstPlayerBanning: boolean;
  isSecondPlayerBanning: boolean;
  maps: PickbanMapServerInterface[];
  physics: Physics;
  timer: number;
}
