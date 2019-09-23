import { Physics } from '../../../enums/physics.enum';
import { CupSystems } from '../../../enums/cup-systems.enum';
import { MulticupResultInterface } from './multicup-result.interface';

export interface MulticupTableInterface {
    fullName: string;
    rounds: string;
    currentRound: number;
    physics: Physics;
    system: CupSystems;
    players: MulticupResultInterface[];
    shortName?: string;
}
