import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MapSuggestion } from 'apps/backend/src/shared/entities/map-suggestion.entity';
import { Repository } from 'typeorm';
import { AdminAddOfflineCupService } from './add-offline-cup.service';
import { WarcupInfo } from 'apps/backend/src/shared/entities/warcup-info.entity';
import { getMapLevelshot } from 'apps/backend/src/shared/helpers/get-map-levelshot';
import { getNextWarcupTime } from '@dfcomps/helpers';
import * as moment from 'moment';
import { WarcupAdminVote } from 'apps/backend/src/shared/entities/warcup-admin-vote.entity';

interface VoteResultMapInterface {
  mapName: string;
  mapAuthor: string;
  weapons: string;
  size: string;
  mapPk3Link: string;
  votesCount: number;
}

@Injectable()
export class AdminWarcupsCronService {
  constructor(
    private readonly addOfflineCupService: AdminAddOfflineCupService,
    @InjectRepository(WarcupInfo) private readonly warcupInfoRepository: Repository<WarcupInfo>,
    @InjectRepository(MapSuggestion) private readonly mapSuggestionsRepository: Repository<MapSuggestion>,
    @InjectRepository(WarcupAdminVote) private readonly warcupAdminVoteRepository: Repository<WarcupAdminVote>,
  ) {}

  @Cron('30 21 * * 6', { timeZone: 'Europe/Moscow' })
  async addWarcup() {
    const warcupInfo: WarcupInfo = (await this.warcupInfoRepository.createQueryBuilder().getOne())!;

    if (!warcupInfo.is_voting_active) {
      return;
    }

    const mapSuggestions: MapSuggestion[] = await this.mapSuggestionsRepository
      .createQueryBuilder('map_suggestions')
      .leftJoinAndSelect('map_suggestions.warcupAdminVotes', 'warcup_admin_votes')
      .orderBy('map_suggestions.suggestions_count', 'DESC')
      .getMany();

    let maxVotesCount = 0;
    const voteResult: VoteResultMapInterface[] = mapSuggestions.map((mapSuggestion: MapSuggestion) => {
      if (mapSuggestion.warcupAdminVotes.length > maxVotesCount) {
        maxVotesCount = mapSuggestion.warcupAdminVotes.length;
      }

      return {
        mapName: mapSuggestion.map_name,
        mapAuthor: mapSuggestion.author,
        weapons: mapSuggestion.weapons,
        size: mapSuggestion.size,
        mapPk3Link: mapSuggestion.pk3_link,
        votesCount: mapSuggestion.warcupAdminVotes.length,
      };
    });

    if (!voteResult.length) {
      return;
    }

    const winnersMapArray: VoteResultMapInterface[] = voteResult.filter(
      ({ votesCount }: VoteResultMapInterface) => votesCount === maxVotesCount,
    );

    const winnerMap: VoteResultMapInterface = winnersMapArray[Math.floor(Math.random() * winnersMapArray.length)];

    this.addOfflineCupService.addOfflineCup(
      {
        fullName: `WarCup #${warcupInfo.next_warcup_number}`,
        shortName: `WarCup #${warcupInfo.next_warcup_number}`,
        startTime: getNextWarcupTime(),
        endTime: moment(getNextWarcupTime()).add(1, 'week').format(),
        mapName: winnerMap.mapName,
        mapAuthor: winnerMap.mapAuthor,
        weapons: winnerMap.weapons,
        addNews: true,
        size: winnerMap.size,
        mapLevelshotLink: getMapLevelshot(winnerMap.mapName),
        mapPk3Link: winnerMap.mapPk3Link,
        multicupId: undefined,
        isCustomMap: false,
      },
      warcupInfo.warcup_bot_id,
    );

    this.warcupInfoRepository
      .createQueryBuilder()
      .update(WarcupInfo)
      .set({
        chosen_map: winnerMap.mapName,
      })
      .execute();
  }

  @Cron('30 22 * * 6', { timeZone: 'Europe/Moscow' })
  async postWarcupStart() {
    const warcupInfo: WarcupInfo = (await this.warcupInfoRepository.createQueryBuilder().getOne())!;

    if (!warcupInfo.is_voting_active) {
      return;
    }

    await this.warcupAdminVoteRepository.createQueryBuilder().delete().execute();
    await this.mapSuggestionsRepository.createQueryBuilder().delete().where({ is_admin_suggestion: true }).execute();

    const nextRotation: number = {
      1: 2,
      2: 3,
      3: 1,
    }[warcupInfo.next_rotation];

    const updatedWarcupInfo: Partial<WarcupInfo> = {
      next_rotation: nextRotation as 1 | 2 | 3,
      next_warcup_number: warcupInfo.next_warcup_number + 1,
    };

    await this.warcupInfoRepository.createQueryBuilder().update(WarcupInfo).set(updatedWarcupInfo).execute();

    this.mapSuggestionsRepository
      .createQueryBuilder()
      .delete()
      .from(MapSuggestion)
      .where({ map_name: warcupInfo.chosen_map })
      .execute();
  }
}
