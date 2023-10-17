import { MapInterface } from '@dfcomps/contracts';

export interface PickbanMapInterface {
  map: MapInterface | null;
  isBannedByPlayer: boolean;
  isBannedByOpponent: boolean;
  isPickedByPlayer: boolean;
  isPickedByOpponent: boolean;
}
