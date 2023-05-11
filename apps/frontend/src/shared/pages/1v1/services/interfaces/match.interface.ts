import { Physics } from './../../../../enums/physics.enum';
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
