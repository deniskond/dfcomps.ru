import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { MapType, WarcupStateInterface, WarcupSuggestionStatsInterface, WarcupVotingState } from '@dfcomps/contracts';
import { UserAccessInterface } from 'apps/backend/src/shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { WarcupInfo } from 'apps/backend/src/shared/entities/warcup-info.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { getNextWarcupTime } from '@dfcomps/helpers';
import { MapSuggestion } from 'apps/backend/src/shared/entities/map-suggestion.entity';

@Injectable()
export class AdminWarcupsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(WarcupInfo) private readonly warcupInfoRepository: Repository<WarcupInfo>,
    @InjectRepository(MapSuggestion) private readonly mapSuggestionsRepository: Repository<MapSuggestion>,
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

  public async getWarcupSuggestionStats(accessToken: string | undefined): Promise<WarcupSuggestionStatsInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      throw new UnauthorizedException('Unauthorized to get warcup suggestion stats without WARCUP_ADMIN role');
    }

    const mapSuggestions: MapSuggestion[] = await this.mapSuggestionsRepository.createQueryBuilder().getMany();
    const strafeMaps: MapSuggestion[] = mapSuggestions.filter(
      ({ map_type }: MapSuggestion) => map_type === MapType.STRAFE,
    );
    const comboMaps: MapSuggestion[] = mapSuggestions.filter(
      ({ map_type, weapons }: MapSuggestion) => map_type === MapType.WEAPON && weapons.length > 1,
    );
    const singleWeaponMaps: MapSuggestion[] = mapSuggestions.filter(
      ({ map_type, weapons }: MapSuggestion) => map_type === MapType.WEAPON && weapons.length === 1,
    );
    const extraMaps: MapSuggestion[] = mapSuggestions.filter(
      ({ map_type }: MapSuggestion) => map_type === MapType.EXTRA,
    );

    return {
      stats: [
        {
          mapType: 'Strafe',
          count: strafeMaps.length,
        },
        {
          mapType: 'Combo',
          count: comboMaps.length,
        },
        {
          mapType: 'Single Weapon',
          count: singleWeaponMaps.length,
        },
        {
          mapType: 'Extra',
          count: extraMaps.length,
        },
      ],
    };
  }
}
