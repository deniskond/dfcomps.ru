import { NewsTypes } from '@dfcomps/contracts';

export function mapNewsTypeEnumToDBNewsTypeId(newsType: NewsTypes): number {
  const newsTypesMap: Record<NewsTypes, number> = {
    [NewsTypes.DFWC_RESULTS]: 7,
    [NewsTypes.MULTICUP_RESULTS]: 6,
    [NewsTypes.OFFLINE_RESULTS]: 5,
    [NewsTypes.OFFLINE_START]: 4,
    [NewsTypes.ONLINE_ANNOUNCE]: 2,
    [NewsTypes.ONLINE_RESULTS]: 1,
    [NewsTypes.SIMPLE]: 3,
  };

  return newsTypesMap[newsType];
}
