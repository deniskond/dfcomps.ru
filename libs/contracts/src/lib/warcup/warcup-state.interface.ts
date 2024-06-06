import { MapType } from './map-type.enum';
import { WarcupVotingState } from './warcup-voting-state.enum';

export interface WarcupStateInterface {
  state: WarcupVotingState;
  nextStateStartTime: string | null;
  nextMapType: MapType;
  chosenMap: string | null;
}
