import { CupInterface } from '@dfcomps/contracts';
import { NewsInterface } from './news.interface';
import { NewsTypes } from './news-types.enum';
import { UploadedDemoInterface } from './uploaded-demo.interface';

export interface NewsOfflineStartInterface extends NewsInterface {
  type: NewsTypes.OFFLINE_START;
  cup: CupInterface;
  cpmDemo?: string;
  cpmRes?: string;
  vq3Demo?: string;
  vq3Res?: string;
  playerDemos?: UploadedDemoInterface[];
  levelshot: string;
}
