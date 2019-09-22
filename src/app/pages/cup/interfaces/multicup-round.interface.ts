import { MulticupRoundResultInterface } from './multicup-round-result.interface';

export interface MulticupRoundInterface {
    fullName: string;
    map: string;
    levelshot: string;
    resultsTable: MulticupRoundResultInterface[];
    shortName?: string;
}
