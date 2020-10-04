import { RegisteredPlayerInterface } from '../../../interfaces/registered-player.interface';
import { CupInterface } from '../../../interfaces/cup.interface';
import { NewsTypes } from '../../../enums/news-types.enum';
import { NewsInterface } from './news.interface';

export interface NewsOnlineAnnounceInterface extends NewsInterface {
    type: NewsTypes.ONLINE_ANNOUNCE;
    cup: CupInterface;
    isRegistered: boolean;
    registeredPlayers: RegisteredPlayerInterface[];
}
