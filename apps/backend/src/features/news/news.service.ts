import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ArchiveNewsResultInterface,
  MulticupResultInterface,
  NewsInterface,
  NewsInterfaceUnion,
  NewsMulticupResultsInterface,
  NewsOfflineResultsInterface,
  NewsOfflineStartInterface,
  NewsOnlineAnnounceInterface,
  NewsOnlineResultsInterface,
  NewsSimpleInterface,
  NewsStreamersResultsInterface,
  NewsTypes,
  Physics,
  ResultsTableInterface,
} from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { TablesService } from '../tables/tables.service';
import { News } from '../../shared/entities/news.entity';
import { NewsComment } from '../../shared/entities/news-comment.entity';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { Multicup } from '../../shared/entities/multicup.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { getMapLevelshot } from '../../shared/helpers/get-map-levelshot';
import { mapCupEntityToInterface } from '../../shared/mappers/cup.mapper';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { formatResultTime } from '@dfcomps/helpers';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupsResultsRepository: Repository<CupResult>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(Multicup) private readonly multicupRepository: Repository<Multicup>,
    private readonly tablesService: TablesService,
    private readonly authService: AuthService,
  ) {}

  public async getAllMainPageNews(accessToken: string): Promise<NewsInterfaceUnion[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const targetTime: string = checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])
      ? moment().add(7, 'days').format()
      : moment().format();

    const news: News[] = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.user', 'user')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .leftJoinAndSelect('news.cup', 'cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .orderBy('news.datetimezone', 'DESC')
      .addOrderBy('news_types.id', 'ASC')
      .where('news.datetimezone < :targetTime', { targetTime })
      .andWhere('news.hide_on_main = :hideOnMain', { hideOnMain: false })
      .limit(10)
      .getMany();

    return await Promise.all(news.map((newsItem: News) => this.mapNewsType(newsItem, userAccess)));
  }

  public async getThemeNews(accessToken: string | undefined, theme: string): Promise<NewsInterfaceUnion[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const targetTime: string = checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])
      ? moment().add(7, 'days').format()
      : moment().format();

    const news: News[] = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.user', 'user')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .leftJoinAndSelect('news.cup', 'cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .orderBy('news.datetimezone', 'DESC')
      .addOrderBy('news_types.id', 'ASC')
      .where('news.datetimezone < :targetTime', { targetTime })
      .andWhere('news.theme = :theme', { theme })
      .limit(10)
      .getMany();

    return await Promise.all(news.map((newsItem: News) => this.mapNewsType(newsItem, userAccess)));
  }

  public async getSingleNews(accessToken: string | undefined, newsId: number): Promise<NewsInterfaceUnion> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const targetTime: string = checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])
      ? moment().add(7, 'days').format()
      : moment().format();

    const newsItem: News | null = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.user', 'user')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .leftJoinAndSelect('news.cup', 'cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .orderBy('news.datetimezone', 'DESC')
      .addOrderBy('news_types.id', 'ASC')
      .where('news.datetimezone < :targetTime', { targetTime })
      .andWhere('news.id = :newsId', { newsId })
      .limit(10)
      .getOne();

    if (!newsItem) {
      throw new NotFoundException(`News with id = ${newsId} not found!`);
    }

    return await this.mapNewsType(newsItem, userAccess);
  }

  public async getNewsArchive(startIndex: number, endIndex: number): Promise<ArchiveNewsResultInterface> {
    const time: string = moment().format();
    const newsCount: number = await this.newsRepository.createQueryBuilder('news').getCount();
    const archiveNews: News[] = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.user', 'users')
      .where('news.datetimezone < :time', { time })
      .orderBy('datetimezone', 'DESC')
      .offset(startIndex)
      .limit(endIndex - startIndex)
      .getMany();

    return {
      news: archiveNews.map((archiveNewsItem: News) => ({
        authorId: archiveNewsItem.user.id,
        authorName: archiveNewsItem.user.displayed_nick,
        datetimezone: archiveNewsItem.datetimezone,
        header: archiveNewsItem.header,
        headerEn: archiveNewsItem.header_en,
        id: archiveNewsItem.id,
      })),
      resultsCount: newsCount,
    };
  }

  private async mapNewsType(newsItem: News, userAccess: UserAccessInterface): Promise<NewsInterfaceUnion> {
    switch (newsItem.newsType.name) {
      case NewsTypes.OFFLINE_START:
        return this.mapOfflineStartNews(newsItem, userAccess);
      case NewsTypes.OFFLINE_RESULTS:
      case NewsTypes.DFWC_RESULTS:
        return this.mapOfflineResultsNews(newsItem);
      case NewsTypes.ONLINE_ANNOUNCE:
        return this.mapOnlineAnnounceNews(newsItem, userAccess);
      case NewsTypes.ONLINE_RESULTS:
        return this.mapOnlineResultsNews(newsItem);
      case NewsTypes.MULTICUP_RESULTS:
        return this.mapMulticupResultsNews(newsItem);
      case NewsTypes.SIMPLE:
        return this.mapSimpleNews(newsItem);
      case NewsTypes.STREAMERS_RESULTS:
        return this.mapStreamersResultsNews(newsItem);
    }
  }

  private async mapOfflineStartNews(news: News, userAccess: UserAccessInterface): Promise<NewsOfflineStartInterface> {
    const baseNews: Omit<NewsInterface, 'type'> = await this.mapBaseNews(news);
    const cup: Cup = (await this.cupsRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where({ id: news.cup.id })
      .getOne())!;

    const levelshot = getMapLevelshot(news.cup.map1!);
    const canUserSeeFutureCups = checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER]);
    const isFutureCup: boolean = moment(cup.start_datetime).isAfter(moment()) && !canUserSeeFutureCups;
    let cpmDemo: string | null = null;
    let cpmRes: string | null = null;
    let vq3Demo: string | null = null;
    let vq3Res: string | null = null;
    let playerDemos: CupDemo[] = [];

    if (userAccess.userId) {
      playerDemos = await this.cupsDemosRepository
        .createQueryBuilder('cups_demos')
        .where('cups_demos.cupId = :cupId', { cupId: cup.id })
        .andWhere('cups_demos.userId = :userId', { userId: userAccess.userId })
        .getMany();

      const bestCpmDemo: CupDemo | undefined = this.findBestPlayerDemo(playerDemos, Physics.CPM);
      const bestVq3Demo: CupDemo | undefined = this.findBestPlayerDemo(playerDemos, Physics.VQ3);

      cpmDemo = bestCpmDemo?.demopath || null;
      cpmRes = bestCpmDemo?.time ? formatResultTime(bestCpmDemo.time) : null;
      vq3Demo = bestVq3Demo?.demopath || null;
      vq3Res = bestVq3Demo?.time ? formatResultTime(bestVq3Demo.time) : null;
    }

    return {
      ...baseNews,
      type: NewsTypes.OFFLINE_START,
      levelshot,
      cup: mapCupEntityToInterface(news.cup, isFutureCup, null, news.id, news.cup.multicup?.id || null),
      cpmDemo,
      cpmRes,
      vq3Demo,
      vq3Res,
      playerDemos: playerDemos.map((demo: CupDemo) => ({
        demopath: demo.demopath,
        physics: demo.physics,
        time: demo.time,
      })),
    };
  }

  private async mapOfflineResultsNews(news: News): Promise<NewsOfflineResultsInterface> {
    const baseNews: Omit<NewsInterface, 'type'> = await this.mapBaseNews(news);
    const levelshot: string = getMapLevelshot(news.cup.map1!);
    const cup: Cup = (await this.cupsRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where({ id: news.cup.id })
      .getOne())!;

    const isFinishedCup: boolean = moment().isAfter(moment(news.cup.end_datetime));
    const emptyResults: ResultsTableInterface = { valid: [], invalid: [] };
    const cpmResults: ResultsTableInterface = isFinishedCup
      ? await this.tablesService.getOfflineCupTable(cup, Physics.CPM)
      : emptyResults;
    const vq3Results: ResultsTableInterface = isFinishedCup
      ? await this.tablesService.getOfflineCupTable(cup, Physics.VQ3)
      : emptyResults;

    return {
      ...baseNews,
      type: NewsTypes.OFFLINE_RESULTS,
      cup: mapCupEntityToInterface(news.cup, false, null, news.id, news.cup.multicup?.id || null),
      levelshot,
      cpmResults,
      vq3Results,
    };
  }

  private async mapOnlineAnnounceNews(
    news: News,
    userAccess: UserAccessInterface,
  ): Promise<NewsOnlineAnnounceInterface> {
    const baseNews: Omit<NewsInterface, 'type'> = await this.mapBaseNews(news);
    const registeredPlayers: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where('cups_results.cupId = :cupId', { cupId: news.cup.id })
      .orderBy('cups_results.id')
      .getMany();
    const isRegistered = !!registeredPlayers.find((cupResult: CupResult) => cupResult.user.id === userAccess.userId);

    return {
      ...baseNews,
      type: NewsTypes.ONLINE_ANNOUNCE,
      isRegistered,
      cup: mapCupEntityToInterface(news.cup, true, null, news.id, null),
      registeredPlayers: registeredPlayers.map((cupResult: CupResult) => ({
        country: cupResult.user.country,
        id: cupResult.user.id,
        nick: cupResult.user.displayed_nick,
      })),
    };
  }

  private async mapOnlineResultsNews(news: News): Promise<NewsOnlineResultsInterface> {
    const baseNews: Omit<NewsInterface, 'type'> = await this.mapBaseNews(news);
    const cupResults: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'user')
      .leftJoinAndSelect('user.ratingChanges', 'rating_changes', 'cups_results.cupId = rating_changes.cupId')
      .where({ cup: { id: news.cup.id } })
      .orderBy('final_sum', 'DESC')
      .addOrderBy('displayed_nick', 'ASC')
      .getMany();

    return {
      ...baseNews,
      type: NewsTypes.ONLINE_RESULTS,
      cup: mapCupEntityToInterface(news.cup, false, null, news.id, news.cup.multicup?.id || null),
      results: cupResults.map((cupResult: CupResult) => ({
        playerId: cupResult.user.id,
        country: cupResult.user.country,
        cpmChange: cupResult.user.ratingChanges[0]?.cpm_change || 0,
        finalSum: cupResult.final_sum,
        nick: cupResult.user.displayed_nick,
        vq3Change: cupResult.user.ratingChanges[0]?.vq3_change || 0,
      })),
    };
  }

  private async mapMulticupResultsNews(news: News): Promise<NewsMulticupResultsInterface> {
    const baseNews: Omit<NewsInterface, 'type'> = await this.mapBaseNews(news);
    const multicup: Multicup = (await this.multicupRepository
      .createQueryBuilder('multicups')
      .where({ id: news.multicup_id })
      .getOne())!;

    const cups: Cup[] = await this.cupsRepository
      .createQueryBuilder('cups')
      .where('cups.multicupId = :multicupId', { multicupId: news.multicup_id })
      .andWhere('cups.rating_calculated = true')
      .orderBy('cups.id', 'ASC')
      .getMany();

    const vq3Results: MulticupResultInterface[] = await this.tablesService.getMulticupTable(
      news.multicup_id,
      cups,
      Physics.VQ3,
      multicup.system,
    );
    const cpmResults: MulticupResultInterface[] = await this.tablesService.getMulticupTable(
      news.multicup_id,
      cups,
      Physics.CPM,
      multicup.system,
    );

    return {
      ...baseNews,
      type: NewsTypes.MULTICUP_RESULTS,
      multicup: { id: multicup.id, name: multicup.name, rounds: multicup.rounds, system: multicup.system },
      vq3Results,
      cpmResults,
    };
  }

  private async mapSimpleNews(news: News): Promise<NewsSimpleInterface> {
    return {
      ...(await this.mapBaseNews(news)),
      type: NewsTypes.SIMPLE,
    };
  }

  private async mapStreamersResultsNews(news: News): Promise<NewsStreamersResultsInterface> {
    return {
      ...(await this.mapBaseNews(news)),
      type: NewsTypes.STREAMERS_RESULTS,
    };
  }

  private async mapBaseNews(news: News): Promise<Omit<NewsInterface, 'type'>> {
    const comments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'user')
      .where({ news: { id: news.id } })
      .orderBy('news_comments.id', 'ASC')
      .getMany();

    const preposted: boolean = moment(news.datetimezone).isAfter(moment());

    return {
      id: news.id,
      authorId: news.user.id,
      authorName: news.user.displayed_nick,
      currentRound: news.cup?.current_round || null,
      datetimezone: news.datetimezone,
      header: news.header,
      headerEn: news.header_en,
      image: news.image,
      cupId: news.cup?.id || null,
      multicupId: news.cup?.multicup?.id || null,
      startTime: news.cup?.start_datetime || null,
      text: news.text,
      textEn: news.text_en,
      youtube: news.youtube,
      tableJson: news.table_json,
      twitch1: news.twitch_1,
      twitch2: news.twitch_2,
      comments: comments.map((newsComment: NewsComment) => ({
        commentId: newsComment.id,
        comment: newsComment.comment,
        datetimezone: newsComment.datetimezone,
        playerId: newsComment.user.id,
        reason: newsComment.reason,
        username: newsComment.user.displayed_nick,
      })),
      preposted,
    };
  }

  private findBestPlayerDemo(playerDemos: CupDemo[], physics: Physics): CupDemo | undefined {
    return playerDemos.reduce((previousBestDemo: CupDemo | undefined, cupDemo: CupDemo) => {
      if (cupDemo.physics !== physics) {
        return previousBestDemo;
      }

      if (previousBestDemo) {
        return cupDemo.time < previousBestDemo.time ? cupDemo : previousBestDemo;
      }

      return cupDemo;
    }, undefined);
  }
}
