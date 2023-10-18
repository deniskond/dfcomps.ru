import { MulticupResultInterface, MulticupSystems, Physics } from '@dfcomps/contracts';

export interface MulticupTableInterface {
  fullName: string;
  rounds: number;
  currentRound: number;
  physics: Physics;
  system: MulticupSystems;
  players: MulticupResultInterface[];
  shortName?: string;
}
