import { MulticupResultInterface, MulticupSystems, Physics } from '@dfcomps/contracts';

export interface MulticupTableInterface {
  fullName: string;
  rounds: string;
  currentRound: number;
  physics: Physics;
  system: MulticupSystems;
  players: MulticupResultInterface[];
  shortName?: string;
}
