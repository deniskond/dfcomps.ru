import { CupInterface } from './cup.interface';
import { NewsTypes } from './news-types.enum';
import { NewsInterface } from './news.interface';

export interface NewsOnlineAnnounceInterface extends NewsInterface {
    type: NewsTypes.ONLINE_ANNOUNCE;
    cup: CupInterface;
    isRegistered: boolean;
}
