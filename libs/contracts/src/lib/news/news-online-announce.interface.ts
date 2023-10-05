import { CupInterface } from '@dfcomps/contracts';
import { NewsInterface } from './news.interface';
import { NewsTypes } from './news-types.enum';
import { RegisteredPlayerInterface } from './registered-player.interface';

export interface NewsOnlineAnnounceInterface extends NewsInterface {
  type: NewsTypes.ONLINE_ANNOUNCE;
  cup: CupInterface;
  isRegistered: boolean;
  registeredPlayers: RegisteredPlayerInterface[];
}
