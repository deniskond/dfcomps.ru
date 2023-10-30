import { Difficulty } from '@dfcomps/contracts';

export interface MapInterface {
  name: string;
  difficulty: Difficulty;
  weapons: string;
  vq3Record: number;
  cpmRecord: number;
}
