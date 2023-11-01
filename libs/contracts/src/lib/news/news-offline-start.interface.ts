import { CupInterface } from '@dfcomps/contracts';
import { NewsInterface } from './news.interface';
import { NewsTypes } from './news-types.enum';
import { UploadedDemoInterface } from './uploaded-demo.interface';

export interface NewsOfflineStartInterface extends NewsInterface {
  type: NewsTypes.OFFLINE_START;
  cup: CupInterface;
  cpmDemo: string | null;
  cpmRes: number | null;
  vq3Demo: string | null;
  vq3Res: number | null;
  playerDemos: UploadedDemoInterface[];
  levelshot: string;
}
