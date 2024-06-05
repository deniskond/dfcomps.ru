import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  MapType,
  WarcupStateInterface,
  WarcupSuggestionStatsInterface,
  WarcupVotingInterface,
  WarcupVotingState,
} from '@dfcomps/contracts';
import { UserAccessInterface } from 'apps/backend/src/shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { WarcupInfo } from 'apps/backend/src/shared/entities/warcup-info.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { getNextWarcupTime } from '@dfcomps/helpers';
import { MapSuggestion } from 'apps/backend/src/shared/entities/map-suggestion.entity';
import { WarcupAdminVote } from 'apps/backend/src/shared/entities/warcup-admin-vote.entity';

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

    return await this.getWarcupStateInfo();
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

  public async getWarcupVoting(accessToken: string | undefined): Promise<WarcupVotingInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      throw new UnauthorizedException('Unauthorized to get warcup voting without WARCUP_ADMIN role');
    }

    const warcupState: WarcupStateInterface = await this.getWarcupStateInfo();

    if (warcupState.state === WarcupVotingState.PAUSED || warcupState.state === WarcupVotingState.WAITING) {
      throw new BadRequestException(`Can't fetch warcup voting info while state is PAUSED or WAITING`);
    }

    const mapSuggestions: MapSuggestion[] = await this.mapSuggestionsRepository
      .createQueryBuilder('map_suggestions')
      .leftJoinAndSelect('map_suggestions.warcupAdminVotes', 'warcup_admin_votes')
      .leftJoinAndSelect('warcup_admin_votes.user', 'users')
      .orderBy('map_suggestions.suggestions_count', 'DESC')
      .getMany();

    const top3Suggestions: MapSuggestion[] = mapSuggestions.slice(0, 3);
    const adminSuggestions: MapSuggestion[] = mapSuggestions.filter(
      (mapSuggestion: MapSuggestion) => mapSuggestion.is_admin_suggestion,
    );
    const adminVotedSuggestions: MapSuggestion[] = mapSuggestions.filter(
      (mapSuggestion: MapSuggestion) => mapSuggestion.warcupAdminVotes.length > 0,
    );
    const suggestionsWithDuplicates: MapSuggestion[] = [
      ...top3Suggestions,
      ...adminSuggestions,
      ...adminVotedSuggestions,
    ];
    const suggestionWithoutDuplicates: MapSuggestion[] = [];
    const seenSuggestionIds = new Set<number>();

    suggestionsWithDuplicates.forEach((mapSuggestion: MapSuggestion) => {
      if (seenSuggestionIds.has(mapSuggestion.id)) {
        return;
      }

      suggestionWithoutDuplicates.push(mapSuggestion);
      seenSuggestionIds.add(mapSuggestion.id);
    });

    return {
      maps: suggestionWithoutDuplicates.map((mapSuggestion: MapSuggestion) => ({
        mapSuggestionId: mapSuggestion.id,
        name: mapSuggestion.map_name,
        weapons: mapSuggestion.weapons,
        adminVotes: mapSuggestion.warcupAdminVotes.map(({ user }: WarcupAdminVote) => user.displayed_nick),
      })),
    };
  }

  private async getWarcupStateInfo(): Promise<WarcupStateInterface> {
    const warcupInfo: WarcupInfo = (await this.warcupInfoRepository.createQueryBuilder().getOne())!;

    if (!warcupInfo.is_voting_active) {
      return {
        state: WarcupVotingState.PAUSED,
        nextStateStartTime: null,
        nextMapType: warcupInfo.next_map_type,
      };
    }

    const currentTime: moment.Moment = moment();
    const nextWarcupStartingTime: moment.Moment = moment(getNextWarcupTime());
    let warcupVotingState: WarcupVotingState;
    let nextStateStartTime: string;

    if (
      currentTime.isSameOrAfter(nextWarcupStartingTime.clone().subtract(1, 'hour')) &&
      currentTime.isBefore(nextWarcupStartingTime)
    ) {
      warcupVotingState = WarcupVotingState.CLOSING;
      nextStateStartTime = nextWarcupStartingTime.format();
    } else if (
      currentTime.isSameOrAfter(nextWarcupStartingTime.clone().subtract(1, 'day')) &&
      currentTime.isBefore(nextWarcupStartingTime.clone().subtract(1, 'hour'))
    ) {
      warcupVotingState = WarcupVotingState.VOTING;
      nextStateStartTime = nextWarcupStartingTime.clone().subtract(1, 'hour').format();
    } else {
      warcupVotingState = WarcupVotingState.WAITING;
      nextStateStartTime = nextWarcupStartingTime.clone().subtract(1, 'day').format();
    }

    return {
      state: warcupVotingState,
      nextStateStartTime,
      nextMapType: warcupInfo.next_map_type,
    };
  }
}
