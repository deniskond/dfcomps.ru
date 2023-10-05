import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cup } from './entities/cup.entity';
import { CupInterface, Physics } from '@dfcomps/contracts';
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
    const nextCup: Cup = await this.getNextCup();
    const serverInfo: CupResult = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .select('server')
      .where({
        cup: {
          id: nextCup.id,
        },
      })
      .andWhere({ user: { id: userAccess.userId } })
      .getOne();

    let server: string | null = null;

    if (serverInfo) {
      server = serverInfo.server === 1 ? nextCup.server1 : nextCup.server2;
    }

    const isFutureCup: boolean = moment(nextCup.start_datetime).isAfter(moment());

    return {
      archiveLink: nextCup.archive_link,
      bonusRating: nextCup.bonus_rating,
      currentRound: nextCup.current_round,
      demosValidated: nextCup.demos_validated,
      startDateTime: nextCup.start_datetime,
      endDateTime: nextCup.end_datetime,
      fullName: nextCup.full_name,
      id: nextCup.id,
      map1: isFutureCup ? null : nextCup.map1,
      map2: nextCup.map2,
      map3: nextCup.map3,
      map4: nextCup.map4,
      map5: nextCup.map5,
      mapAuthor: isFutureCup ? null : nextCup.map_author,
      mapPk3: isFutureCup ? null : nextCup.map_pk3,
      mapSize: isFutureCup ? null : nextCup.map_size,
      mapWeapons: isFutureCup ? null : nextCup.map_weapons,
      multicupId: nextCup.multicup_id,
      physics: nextCup.physics as Physics,
      ratingCalculated: nextCup.rating_calculated,
      server,
      shortName: nextCup.short_name,
      system: nextCup.system,
      timer: nextCup.timer,
      twitch: nextCup.twitch,
      type: nextCup.type,
      useTwoServers: nextCup.use_two_servers,
      youtube: nextCup.youtube,
      newsId: nextCup.news[0].id,
      customMap: isFutureCup ? null : nextCup.custom_map,
      customNews: isFutureCup ? null : nextCup.custom_news,
      cupId: nextCup.id,
    };
  }

  private async getNextCup(): Promise<Cup> {
    const cupWithTimer: Cup = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .where({ timer: true })
      .limit(1)
      .getOne();

    if (cupWithTimer) {
      return cupWithTimer;
    }

    const nextFutureCup: Cup = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .where('end_datetime > now()')
      .orderBy('end_datetime', 'ASC')
      .limit(1)
      .getOne();

    if (nextFutureCup) {
      return nextFutureCup;
    }

    const previousStartedCup: Cup = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .orderBy('end_datetime', 'DESC')
      .limit(1)
      .getOne();

    return previousStartedCup;
  }
}
