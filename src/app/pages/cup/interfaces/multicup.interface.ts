import { CupSystems } from '../../../enums/cup-systems.enum';
import { MultiCupResultInterface } from './multicup-result.interface';

export interface MultiCupInterface {
    fullName: string;
    rounds: string;
    system: CupSystems;
    resultsTable: MultiCupResultInterface[];
    shortName?: string;
}
