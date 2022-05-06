import { API_URL } from '../../../app/configs/url-params.config';
import { AdminValidationDto, PlayerDemosValidationDto } from '../models/admin-validation.dto';
import {
  AdminDemoValidationStatus,
  AdminValidationInterface,
  PlayerDemosValidationInterface,
} from '../models/admin-validation.interface';

const validationStatusesMap: Record<string, AdminDemoValidationStatus> = {
  '0': AdminDemoValidationStatus.NOT_CHECKED,
  '1': AdminDemoValidationStatus.VALIDATED_OK,
  '2': AdminDemoValidationStatus.VALIDATED_FAILED,
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

function mapPlayerDemo(playerDemos: PlayerDemosValidationDto, cupId: string): PlayerDemosValidationInterface {
  return {
    nick: playerDemos.nick,
    country: playerDemos.country,
    demos: playerDemos.demos.map((playerDemo) => ({
      time: playerDemo.ftime,
      validationStatus: validationStatusesMap[playerDemo.verified],
      validationFailedReason: playerDemo.reason,
      demoLink: `${API_URL}/uploads/demos/cup/${cupId}/${playerDemo.demopath}`,
    })),
  };
}
