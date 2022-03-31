import { NewsMulticupResultsInterface } from './news-multicup-results.interface';
import { NewsOfflineResultsInterface } from './news-offline-results.interface';
import { NewsOfflineStartInterface } from './news-offline-start.interface';
import { NewsOnlineAnnounceInterface } from './news-online-announce.interface';
import { NewsOnlineResultsInterface } from './news-online-results.interface';
import { NewsSimpleInterface } from './news-simple.interface';

export type NewsInterfaceUnion =
  | NewsMulticupResultsInterface
  | NewsOfflineResultsInterface
  | NewsOfflineStartInterface
  | NewsOnlineAnnounceInterface
  | NewsOnlineResultsInterface
  | NewsSimpleInterface;
