import { NewsTypes } from '@dfcomps/contracts';

export function mapNewsTypeToHumanTitle(newsType: NewsTypes): string {
  return {
    [NewsTypes.OFFLINE_START]: 'Offline cup start',
    [NewsTypes.OFFLINE_RESULTS]: 'Offline cup results',
    [NewsTypes.ONLINE_ANNOUNCE]: 'Online cup announce',
    [NewsTypes.ONLINE_RESULTS]: 'Online cup results',
    [NewsTypes.MULTICUP_RESULTS]: 'Multicup results',
    [NewsTypes.SIMPLE]: 'Simple text',
    [NewsTypes.DFWC_ROUND_RESULTS]: 'DFWC round results',
    [NewsTypes.STREAMERS_RESULTS]: 'Results for streamers',
  }[newsType];
}
