import { MapInterface } from '@dfcomps/contracts';

export interface PickbanMapServerInterface {
  map: MapInterface;
  isBannedByFirstPlayer: boolean;
  isBannedBySecondPlayer: boolean;
  isPickedByFirstPlayer: boolean;
  isPickedBySecondPlayer: boolean;
}
