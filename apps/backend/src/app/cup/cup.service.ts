import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cup } from './entities/cup.entity';
import { CupInterface } from '@dfcomps/contracts';
import { News } from '../news/entities/news.entity';
import { CupResult } from './entities/cup-result.entity';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../interfaces/user-access.interface';
import * as moment from 'moment'; 

@Injectable()
export class CupService {
  constructor(
    @InjectRepository(Cup) private readonly cupRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupResultRepository: Repository<CupResult>,
    private readonly authService: AuthService,
  ) {}

  public async getNextCupInfo(accessToken: string): Promise<CupInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const nextCup: any = await this.getNextCup();
    const serverInfo: CupResult = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .select('server')
      .where({ cupId: nextCup['cups_id'] })
      .andWhere({ playerId: userAccess.userId })
      .getOne();

    let server: string | null = null;

    if (serverInfo) {
      server = serverInfo.server === 1 ? nextCup['cups_server1'] : nextCup['cups_server2'];
    }

    const startDateTime = nextCup['cups_start_datetime'];
    const isFutureCup: boolean = moment(startDateTime).isAfter(moment());

    return {
      archiveLink: nextCup['cups_archive_link'],
      bonusRating: nextCup['cups_bonus_rating'],
      currentRound: nextCup['cups_current_round'],
      demosValidated: nextCup['cups_demos_validated'],
      startDateTime: nextCup['cups_start_datetime'],
      endDateTime: nextCup['cups_end_datetime'],
      fullName: nextCup['cups_full_name'],
      id: nextCup['cups_id'],
      map1: isFutureCup ? null : nextCup['cups_map1'],
      map2: nextCup['cups_map2'],
      map3: nextCup['cups_map3'],
      map4: nextCup['cups_map4'],
      map5: nextCup['cups_map5'],
      mapAuthor: isFutureCup ? null : nextCup['cups_map_author'],
      mapPk3: isFutureCup ? null : nextCup['cups_map_pk3'],
      mapSize: isFutureCup ? null : nextCup['cups_map_size'],
      mapWeapons: isFutureCup ? null : nextCup['cups_map_weapons'],
      multicupId: nextCup['cups_multicup_id'],
      physics: nextCup['cups_physics'],
      ratingCalculated: nextCup['cups_rating_calculated'],
      server,
      shortName: nextCup['cups_short_name'],
      system: nextCup['cups_system'],
      timer: nextCup['cups_timer'],
      twitch: nextCup['cups_twitch'],
      type: nextCup['cups_type'],
      useTwoServers: nextCup['cups_use_two_servers'],
      youtube: nextCup['cups_youtube'],
      newsId: nextCup['news_id'],
      customMap: isFutureCup ? null : nextCup['cups_custom_map'],
      customNews: isFutureCup ? null : nextCup['cups_custom_news'],
      cupId: nextCup['cups_id'],
    };
  }

  private async getNextCup(): Promise<any> {
    const cupWithTimer = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect(News, 'news', 'news.cup_id = cups.id')
      .where({ timer: true })
      .limit(1)
      .getRawOne();

    if (cupWithTimer) {
      return cupWithTimer;
    }

    const nextFutureCup = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect(News, 'news', 'news.cup_id = cups.id')
      .where('end_datetime > now()')
      .orderBy('end_datetime', 'ASC')
      .limit(1)
      .getRawOne();

    if (nextFutureCup) {
      return nextFutureCup;
    }

    const previousStartedCup = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect(News, 'news', 'news.cup_id = cups.id')
      .orderBy('end_datetime', 'DESC')
      .limit(1)
      .getRawOne();

    return previousStartedCup;
  }
}
