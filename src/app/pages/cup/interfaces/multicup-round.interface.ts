import { MultiCupRoundResultInterface } from './multicup-round-result.interface';

export interface MultiCupRoundInterface {
    fullName: string;
    map: string;
    levelshot: string;
    resultsTable: MultiCupRoundResultInterface[];
    shortName?: string;
}
