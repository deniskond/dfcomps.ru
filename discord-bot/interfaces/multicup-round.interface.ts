import { MulticupRoundResultInterface } from './multicup-round-result.interface';
import { Physics } from './physics.enum';

export interface MulticupRoundInterface {
    fullName: string;
    map: string;
    levelshot: string;
    resultsTable: MulticupRoundResultInterface[];
    physics: Physics;
    hasPoints: boolean;
    shortName?: string;
}
