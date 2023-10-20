import {
  AdminDemoValidationStatuses,
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
} from '@dfcomps/contracts';
import { AdminValidationDto, PlayerDemosValidationDto } from '../models/admin-validation.dto';

const validationStatusesMap: Record<string, AdminDemoValidationStatuses> = {
  '0': AdminDemoValidationStatuses.NOT_CHECKED,
  '1': AdminDemoValidationStatuses.VALIDATED_OK,
  '2': AdminDemoValidationStatuses.VALIDATED_FAILED,
};

export function mapAdminValidationDtoToInterface(validationInfo: AdminValidationDto): AdminValidationInterface {
  return {
    vq3Demos: validationInfo.players_demos_vq3.map((playerDemos: PlayerDemosValidationDto) =>
      mapPlayerDemo(playerDemos, validationInfo.cup.id),
    ),
    cpmDemos: validationInfo.players_demos_cpm.map((playerDemos: PlayerDemosValidationDto) =>
      mapPlayerDemo(playerDemos, validationInfo.cup.id),
    ),
    cupInfo: {
      id: validationInfo.cup.id,
      fullName: validationInfo.cup.full_name,
    },
  };
}

function mapPlayerDemo(playerDemos: PlayerDemosValidationDto, cupId: string): AdminPlayerDemosValidationInterface {
  return {
    nick: playerDemos.nick,
    country: playerDemos.country,
    demos: playerDemos.demos.map((playerDemo) => ({
      time: playerDemo.ftime,
      validationStatus: validationStatusesMap[playerDemo.verified],
      validationFailedReason: playerDemo.reason,
      demoLink: `/uploads/demos/cup${cupId}/${playerDemo.demopath}`,
      id: playerDemo.id,
    })),
  };
}
