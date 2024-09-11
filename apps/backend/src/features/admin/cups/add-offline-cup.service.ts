import { AddOfflineCupDto, CupStates, CupTypes, NewsTypes } from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cup } from 'apps/backend/src/shared/entities/cup.entity';
import { News } from 'apps/backend/src/shared/entities/news.entity';
import { mapNewsTypeEnumToDBNewsTypeId } from 'apps/backend/src/shared/mappers/news-types.mapper';
import { LevelshotsService } from 'apps/backend/src/shared/services/levelshots.service';
import * as moment from 'moment-timezone';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class AdminAddOfflineCupService {
  constructor(
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    private readonly levelshotsService: LevelshotsService,
  ) {}

  public async addOfflineCup(addOfflineCupDto: AddOfflineCupDto, userId: number): Promise<void> {
    const startDatetime = moment(addOfflineCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(addOfflineCupDto.endTime).tz('Europe/Moscow').format();

    this.levelshotsService.downloadLevelshot(addOfflineCupDto.mapName);

    const queryResult: InsertResult = await this.cupsRepository
      .createQueryBuilder()
      .insert()
      .into(Cup)
      .values([
        {
          full_name: addOfflineCupDto.fullName,
          short_name: addOfflineCupDto.shortName,
          youtube: null,
          twitch: null,
          current_round: 1,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          server1: '',
          server2: '',
          map1: addOfflineCupDto.mapName,
          map2: null,
          map3: null,
          map4: null,
          map5: null,
          physics: 'mixed',
          type: CupTypes.OFFLINE,
          map_weapons: addOfflineCupDto.weapons,
          map_author: addOfflineCupDto.mapAuthor,
          map_pk3: addOfflineCupDto.mapPk3Link,
          map_size: addOfflineCupDto.size,
          archive_link: null,
          bonus_rating: 0,
          system: null,
          custom_map: addOfflineCupDto.isCustomMap ? addOfflineCupDto.mapPk3Link : null,
          custom_news: null,
          validation_archive_link: null,
          timer: false,
          rating_calculated: false,
          use_two_servers: false,
          demos_validated: false,
          multicup: addOfflineCupDto.multicupId ? { id: addOfflineCupDto.multicupId } : null,
          state: CupStates.WAITING_FOR_FINISH,
        },
      ])
      .execute();

    if (addOfflineCupDto.addNews) {
      const cupId: number = queryResult.identifiers[0].id;

      await this.newsRepository
        .createQueryBuilder()
        .insert()
        .into(News)
        .values([
          {
            header: `Старт ${addOfflineCupDto.fullName}!`,
            header_en: `${addOfflineCupDto.fullName} start!`,
            text: '',
            text_en: '',
            user: { id: userId },
            datetimezone: startDatetime,
            newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_START) },
            cup: { id: cupId },
            comments_count: 0,
            hide_on_main: false,
          },
        ])
        .execute();

      await this.newsRepository
        .createQueryBuilder()
        .insert()
        .into(News)
        .values([
          {
            header: `Результаты ${addOfflineCupDto.fullName}`,
            header_en: `Results: ${addOfflineCupDto.fullName}`,
            text: '',
            text_en: '',
            user: { id: userId },
            datetimezone: endDatetime,
            newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_RESULTS) },
            cup: { id: cupId },
            comments_count: 0,
            hide_on_main: false,
          },
        ])
        .execute();
    }
  }
}
