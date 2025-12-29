import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  MapType,
  WarcupStateInterface,
  WarcupSuggestionStatsInterface,
  WarcupVotingInterface,
  WarcupVotingState,
  ParsedMapInfoInterface,
} from '@dfcomps/contracts';
import { UserAccessInterface } from 'apps/backend/src/shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { WarcupInfo } from 'apps/backend/src/shared/entities/warcup-info.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { getNextWarcupTime, mapWeaponsToString } from '@dfcomps/helpers';
import { MapSuggestion } from 'apps/backend/src/shared/entities/map-suggestion.entity';
import { WarcupAdminVote } from 'apps/backend/src/shared/entities/warcup-admin-vote.entity';
import { Cup } from 'apps/backend/src/shared/entities/cup.entity';
import { getMapLevelshot } from 'apps/backend/src/shared/helpers/get-map-levelshot';
import { LevelshotsService } from 'apps/backend/src/shared/services/levelshots.service';
import { MapParsingService } from 'apps/backend/src/shared/services/map-parsing.service';

@Injectable()
export class AdminWarcupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly mapParsingService: MapParsingService,
    private readonly levelshotsService: LevelshotsService,
    @InjectRepository(WarcupInfo) private readonly warcupInfoRepository: Repository<WarcupInfo>,
    @InjectRepository(MapSuggestion) private readonly mapSuggestionsRepository: Repository<MapSuggestion>,
    @InjectRepository(WarcupAdminVote) private readonly warcupAdminVoteRepository: Repository<WarcupAdminVote>,
    @InjectRepository(Cup) private readonly cupRepository: Repository<Cup>,
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

  public async getWarcupVotingInfo(accessToken: string | undefined): Promise<WarcupVotingInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      throw new UnauthorizedException('Unauthorized to get warcup voting without WARCUP_ADMIN role');
    }

    const warcupState: WarcupStateInterface = await this.getWarcupStateInfo();

    if (warcupState.state === WarcupVotingState.PAUSED || warcupState.state === WarcupVotingState.WAITING) {
      throw new BadRequestException(`Can't fetch warcup voting info while state is PAUSED or WAITING`);
    }

    const warcupInfo: WarcupInfo = (await this.warcupInfoRepository.createQueryBuilder().getOne())!;
    const nextWarcupMapType: MapType = {
      1: MapType.STRAFE,
      2: MapType.WEAPON,
      3: MapType.WEAPON,
    }[warcupInfo.next_rotation];

    const mapSuggestions: MapSuggestion[] = await this.mapSuggestionsRepository
      .createQueryBuilder('map_suggestions')
      .leftJoinAndSelect('map_suggestions.warcupAdminVotes', 'warcup_admin_votes')
      .leftJoinAndSelect('warcup_admin_votes.user', 'users1')
      .leftJoinAndSelect('map_suggestions.user', 'users2')
      .where({ is_blacklisted: false })
      .orderBy('map_suggestions.suggestions_count', 'DESC')
      .getMany();

    const allSuggestionsForNextMapType: MapSuggestion[] = mapSuggestions.filter(
      ({ map_type }: MapSuggestion) => map_type === nextWarcupMapType,
    );
    const adminSuggestions: MapSuggestion[] = mapSuggestions.filter(
      (mapSuggestion: MapSuggestion) => mapSuggestion.is_admin_suggestion,
    );
    const adminVotedSuggestions: MapSuggestion[] = mapSuggestions.filter(
      (mapSuggestion: MapSuggestion) => mapSuggestion.warcupAdminVotes.length > 0,
    );
    const suggestionsWithDuplicates: MapSuggestion[] = [
      ...allSuggestionsForNextMapType,
      ...adminSuggestions,
      ...adminVotedSuggestions,
    ];
    let suggestionWithoutDuplicates: MapSuggestion[] = [];
    const seenSuggestionIds = new Set<number>();

    suggestionsWithDuplicates.forEach((mapSuggestion: MapSuggestion) => {
      if (seenSuggestionIds.has(mapSuggestion.id)) {
        return;
      }

      suggestionWithoutDuplicates.push(mapSuggestion);
      seenSuggestionIds.add(mapSuggestion.id);
    });

    suggestionWithoutDuplicates = suggestionWithoutDuplicates.sort(
      (suggestionA, suggestionB) => suggestionA.id - suggestionB.id,
    );

    const currentVote: WarcupAdminVote | null = await this.warcupAdminVoteRepository
      .createQueryBuilder('warcup_admin_votes')
      .leftJoinAndSelect('warcup_admin_votes.mapSuggestion', 'map_suggestions')
      .leftJoinAndSelect('warcup_admin_votes.user', 'users')
      .where({ user: { id: userAccess.userId } })
      .getOne();

    const adminSuggestedMap: MapSuggestion | undefined = mapSuggestions.find(
      (mapSuggestion: MapSuggestion) =>
        mapSuggestion.is_admin_suggestion === true && mapSuggestion.user.id === userAccess.userId,
    );

    return {
      maps: suggestionWithoutDuplicates.map((mapSuggestion: MapSuggestion) => ({
        mapSuggestionId: mapSuggestion.id,
        name: mapSuggestion.map_name,
        weapons: mapSuggestion.weapons,
        adminVotes: mapSuggestion.warcupAdminVotes.map(({ user }: WarcupAdminVote) => user.displayed_nick),
        levelshot: getMapLevelshot(mapSuggestion.map_name),
        author: mapSuggestion.author,
        suggestBy: mapSuggestion.user.displayed_nick,
      })),
      currentVotedMapSuggestionId: currentVote ? currentVote.mapSuggestion.id : null,
    };
  }

  public async warcupVote(accessToken: string | undefined, mapSuggestionId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      throw new UnauthorizedException('Unauthorized to vote for warcup map without WARCUP_ADMIN role');
    }

    const warcupState: WarcupStateInterface = await this.getWarcupStateInfo();

    if (warcupState.state !== WarcupVotingState.VOTING) {
      throw new BadRequestException(`Can't vote for warcup map while state is not VOTING`);
    }

    const suggestedMap: MapSuggestion | null = await this.mapSuggestionsRepository
      .createQueryBuilder()
      .where({ id: mapSuggestionId })
      .getOne();

    if (!suggestedMap) {
      throw new BadRequestException(`Map suggestion with id = ${mapSuggestionId} does not exist`);
    }

    await this.warcupAdminVoteRepository
      .createQueryBuilder()
      .delete()
      .from(WarcupAdminVote)
      .where({ user: { id: userAccess.userId } })
      .execute();

    await this.warcupAdminVoteRepository
      .createQueryBuilder()
      .insert()
      .into(WarcupAdminVote)
      .values([
        {
          user: {
            id: userAccess.userId!,
          },
          mapSuggestion: {
            id: mapSuggestionId,
          },
        },
      ])
      .execute();
  }

  public async warcupAdminSuggest(accessToken: string | undefined, mapName: string): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      throw new UnauthorizedException(`Can't make warcup admin map suggestion without WARCUP_ADMIN role`);
    }

    const normalizedMapname = mapName.trim().toLowerCase();

    if (!normalizedMapname) {
      throw new BadRequestException(`Empty map name`);
    }

    const alreadyAdminSuggestedMap: MapSuggestion | null = await this.mapSuggestionsRepository
      .createQueryBuilder()
      .where({ is_admin_suggestion: true })
      .andWhere({ map_name: normalizedMapname })
      .getOne();

    if (alreadyAdminSuggestedMap) {
      throw new BadRequestException(`Map ${normalizedMapname} was already suggested in admin vote`);
    }

    let parsedMapInfo: ParsedMapInfoInterface;

    try {
      parsedMapInfo = await this.mapParsingService.getParsedMapInfo(normalizedMapname);
    } catch (e) {
      throw new NotFoundException(`Map ${normalizedMapname} was not found`);
    }

    this.levelshotsService.downloadLevelshot(normalizedMapname);

    await this.mapSuggestionsRepository
      .createQueryBuilder()
      .insert()
      .into(MapSuggestion)
      .values([
        {
          map_name: normalizedMapname,
          suggestions_count: 1,
          author: parsedMapInfo.author,
          weapons: mapWeaponsToString(parsedMapInfo.weapons),
          is_admin_suggestion: true,
          size: parsedMapInfo.size,
          pk3_link: parsedMapInfo.pk3,
          is_blacklisted: false,
          user: {
            id: userAccess.userId!,
          },
        },
      ])
      .execute();
  }

  private async getWarcupStateInfo(): Promise<WarcupStateInterface> {
    const warcupInfo: WarcupInfo = (await this.warcupInfoRepository.createQueryBuilder().getOne())!;

    if (!warcupInfo.is_voting_active) {
      return {
        state: WarcupVotingState.PAUSED,
        nextStateStartTime: null,
        nextMapType: this.mapWarcupRotationToMapType(warcupInfo.next_rotation),
        chosenMap: null,
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
      currentTime.isSameOrAfter(nextWarcupStartingTime.clone().add(1, 'minute').subtract(7, 'day')) &&
      currentTime.isBefore(nextWarcupStartingTime.clone().subtract(1, 'hour'))
    ) {
      warcupVotingState = WarcupVotingState.VOTING;
      nextStateStartTime = nextWarcupStartingTime.clone().subtract(1, 'hour').format();
    } else {
      warcupVotingState = WarcupVotingState.WAITING;
      nextStateStartTime = nextWarcupStartingTime.clone().add(1, 'minute').subtract(7, 'day').format();
    }

    return {
      state: warcupVotingState,
      nextStateStartTime,
      nextMapType: this.mapWarcupRotationToMapType(warcupInfo.next_rotation),
      chosenMap: warcupVotingState === WarcupVotingState.CLOSING ? warcupInfo.chosen_map : null,
    };
  }

  private mapWarcupRotationToMapType(rotationNumber: 1 | 2 | 3): MapType {
    return {
      1: MapType.STRAFE,
      2: MapType.WEAPON,
      3: MapType.WEAPON,
    }[rotationNumber];
  }
}
