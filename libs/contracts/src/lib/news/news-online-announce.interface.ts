import { NewsInterface } from './news.interface';
import { NewsTypes } from './news-types.enum';
import { RegisteredPlayerInterface } from './registered-player.interface';
import { CupInterface } from '../cup/cup.interface';

export interface NewsOnlineAnnounceInterface extends NewsInterface {
  type: NewsTypes.ONLINE_ANNOUNCE;
  cup: CupInterface;
  isRegistered: boolean;
  registeredPlayers: RegisteredPlayerInterface[];
  timerId: string | null;
}
