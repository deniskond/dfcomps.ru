import { UploadedDemoInterface } from '../../../interfaces/uploaded-demo.interface';
import { CupInterface } from '../../../interfaces/cup.interface';
import { NewsTypes } from '../../../enums/news-types.enum';
import { NewsInterface } from './news.interface';

export interface NewsOfflineStartInterface extends NewsInterface {
    type: NewsTypes.OFFLINE_START;
    cup: CupInterface;
    cpmDemo?: string;
    cpmRes?: string;
    vq3Demo?: string;
    vq3Res?: string;
    playerDemos?: UploadedDemoInterface[];
}
