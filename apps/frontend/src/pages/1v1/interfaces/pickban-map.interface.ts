import { MapInterface } from '../services/interfaces/map.interface';

export interface PickbanMapInterface {
  map: MapInterface | null;
  isBannedByPlayer: boolean;
  isBannedByOpponent: boolean;
  isPickedByPlayer: boolean;
  isPickedByOpponent: boolean;
}
