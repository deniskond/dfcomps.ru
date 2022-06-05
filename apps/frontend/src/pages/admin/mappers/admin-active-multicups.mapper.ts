import { AdminActiveMulticupsDto } from '../models/admin-active-multicups.dto';
import { AdminActiveMulticupInterface } from '../models/admin-active-multicup.interface';

export function mapAdminActiveMulticupsCupsDtoToInterface(
  activeMulticupsDto: AdminActiveMulticupsDto,
): AdminActiveMulticupInterface[] {
  return activeMulticupsDto.multicups.map(({ multicup_id, name }) => ({
    multicupId: multicup_id,
    name,
  }));
}
