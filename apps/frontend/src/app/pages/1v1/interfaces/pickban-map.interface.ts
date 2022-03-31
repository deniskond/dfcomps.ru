import { MapInterface } from '../services/interfaces/map.interface';

export interface PickbanMapInterface {
  map: MapInterface;
  isBannedByPlayer: boolean;
  isBannedByOpponent: boolean;
  isPickedByPlayer: boolean;
  isPickedByOpponent: boolean;
}
