import { CupSystems } from './cup-systems.enum';
import { MulticupResultInterface } from './multicup-result.interface';
import { Physics } from './physics.enum';

export interface MulticupTableInterface {
    fullName: string;
    rounds: string;
    currentRound: number;
    physics: Physics;
    system: CupSystems;
    players: MulticupResultInterface[];
    shortName?: string;
}
