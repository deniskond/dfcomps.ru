import { CupSystems } from '../../../enums/cup-systems.enum';
import { MulticupResultInterface } from './multicup-result.interface';

export interface MulticupTableInterface {
    fullName: string;
    rounds: string;
    system: CupSystems;
    players: MulticupResultInterface[];
    shortName?: string;
}
