import { WrListItemInterface } from './wr-list-item.interface';

export interface WrListResponseInterface {
  records: WrListItemInterface[];
  totalCount: number;
}
