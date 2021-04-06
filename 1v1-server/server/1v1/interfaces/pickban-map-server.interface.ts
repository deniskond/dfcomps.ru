import { MapInterface } from './map.interface';

export interface PickbanMapServerInterface {
    map: MapInterface;
    isBannedByFirstPlayer: boolean;
    isBannedBySecondPlayer: boolean;
    isPickedByFirstPlayer: boolean;
    isPickedBySecondPlayer: boolean;
}
