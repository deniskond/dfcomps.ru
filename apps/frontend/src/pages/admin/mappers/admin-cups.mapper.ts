import { CupTypes } from '../../../app/enums/cup-types.enum';
import { Physics } from '../../../app/enums/physics.enum';
import { AdminCupDto } from '../models/admin-cup.dto';
import { AdminCupInterface } from '../models/admin-cup.interface';
import { getHumanTime } from './get-human-time';

export function mapAdminCupsDtoToInterface(cups: AdminCupDto[]): AdminCupInterface[] {
  return cups.map((cup: AdminCupDto) => ({
    id: cup.id,
    fullName: cup.full_name,
    duration: getHumanTime(cup.start_datetime) + ' - ' + getHumanTime(cup.end_datetime),
    physics: cup.physics as unknown as Physics | 'mixed',
    type: cup.type as unknown as CupTypes,
    validationAvailable: cup.rating_calculated === '0',
  }));
}
