import { Difficulty } from '../enums/difficulty.enum';

export interface MapInterface {
    name: string;
    difficulty: Difficulty;
    weapons: string;
}
