import { NewsMulticupResultsInterface } from '../services/news-service/interfaces/news-multicup-results.interface';
import { NewsOfflineResultsInterface } from '../services/news-service/interfaces/news-offline-results.interface';
import { NewsOfflineStartInterface } from '../services/news-service/interfaces/news-offline-start.interface';
import { NewsOnlineAnnounceInterface } from '../services/news-service/interfaces/news-online-announce.interface';
import { NewsOnlineResultsInterface } from '../services/news-service/interfaces/news-online-results.interface';
import { NewsSimpleInterface } from '../services/news-service/interfaces/news-simple.interface';

export type NewsInterfaceUnion =
  | NewsMulticupResultsInterface
  | NewsOfflineResultsInterface
  | NewsOfflineStartInterface
  | NewsOnlineAnnounceInterface
  | NewsOnlineResultsInterface
  | NewsSimpleInterface;
