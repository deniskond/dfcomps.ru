import { NewsInterface } from './news.interface';
import { NewsTypes } from './news-types.enum';
import { UploadedDemoInterface } from './uploaded-demo.interface';
import { CupInterface } from '../cup/cup.interface';

export interface NewsOfflineStartInterface extends NewsInterface {
  type: NewsTypes.OFFLINE_START;
  cup: CupInterface;
  cpmDemo: string | null;
  cpmRes: string | null;
  vq3Demo: string | null;
  vq3Res: string | null;
  playerDemos: UploadedDemoInterface[];
  levelshot: string;
}
