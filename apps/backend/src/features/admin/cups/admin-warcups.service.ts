import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { WarcupStateInterface, WarcupVotingState } from '@dfcomps/contracts';
import { UserAccessInterface } from 'apps/backend/src/shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { WarcupInfo } from 'apps/backend/src/shared/entities/warcup-info.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { getNextWarcupTime } from '@dfcomps/helpers';

@Injectable()
export class AdminWarcupsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(WarcupInfo) private readonly warcupInfoRepository: Repository<WarcupInfo>,
  ) {}

  public async getWarcupState(accessToken: string | undefined): Promise<WarcupStateInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      throw new UnauthorizedException('Unauthorized to get warcup state without WARCUP_ADMIN role');
    }

    const warcupInfo: WarcupInfo = (await this.warcupInfoRepository.createQueryBuilder().getOne())!;

    if (!warcupInfo.is_voting_active) {
      return {
        state: WarcupVotingState.PAUSED,
        nextStateStartTime: null,
        nextMapType: warcupInfo.next_map_type,
      };
    }

    const currentTime: moment.Moment = moment();
    const nextWarcupStartingTime = moment(getNextWarcupTime());
    let warcupVotingState: WarcupVotingState;
    let nextStateStartTime: string;

    if (
      currentTime.isSameOrAfter(nextWarcupStartingTime.subtract(1, 'hour')) &&
      currentTime.isBefore(nextWarcupStartingTime)
    ) {
      warcupVotingState = WarcupVotingState.CLOSING;
      nextStateStartTime = nextWarcupStartingTime.format();
    } else if (
      currentTime.isSameOrAfter(nextWarcupStartingTime.subtract(1, 'day')) &&
      currentTime.isBefore(nextWarcupStartingTime.subtract(1, 'hour'))
    ) {
      warcupVotingState = WarcupVotingState.VOTING;
      nextStateStartTime = nextWarcupStartingTime.subtract(1, 'hour').format();
    } else {
      warcupVotingState = WarcupVotingState.WAITING;
      nextStateStartTime = nextWarcupStartingTime.subtract(1, 'day').format();
    }

    return {
      state: warcupVotingState,
      nextStateStartTime,
      nextMapType: warcupInfo.next_map_type,
    };
  }
}
