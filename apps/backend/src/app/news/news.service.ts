import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import {
  InvalidDemoInterface,
  NewsInterface,
  NewsInterfaceUnion,
  NewsMulticupResultsInterface,
  NewsOfflineResultsInterface,
  NewsOfflineStartInterface,
  NewsOnlineAnnounceInterface,
  NewsOnlineResultsInterface,
  NewsTypes,
  Physics,
  ResultsTableInterface,
  UserRole,
  ValidDemoInterface,
  VerifiedStatuses,
} from '@dfcomps/contracts';
import { UserAccessInterface } from '../interfaces/user-access.interface';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { CupResult } from '../cup/entities/cup-result.entity';
import { mapCupEntityToInterface } from '../mappers/cup.mapper';
import { NewsComment } from '../comments/entities/news-comment.entity';
import { Cup } from '../cup/entities/cup.entity';
import { getMapLevelshot } from '../helpers/get-map-levelshot';
import { CupDemo } from '../cup/entities/cup-demo.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupsResultsRepository: Repository<CupResult>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    private readonly authService: AuthService,
  ) {}

  public async getAllMainPageNews(accessToken: string): Promise<NewsInterfaceUnion[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const targetTime: string = userAccess?.roles.some((role) => role === UserRole.ADMIN || role === UserRole.SUPERADMIN)
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
      .andWhere({ newsType: { name: NewsTypes.OFFLINE_RESULTS } }) // test
      .limit(10) // 10
      .getMany();

    // return news as any;

    const mappedNews: NewsInterfaceUnion[] = [];

    await new Promise<void>((resolve) =>
      news.forEach(async (newsItem: News, index: number) => {
        switch (newsItem.newsType.name) {
          case NewsTypes.OFFLINE_START:
            mappedNews.push(await this.mapOfflineStartNews(newsItem, userAccess));
            break;
          case NewsTypes.OFFLINE_RESULTS:
          case NewsTypes.DFWC_RESULTS:
            mappedNews.push(await this.mapOfflineResultsNews(newsItem));
            break;
          case NewsTypes.ONLINE_ANNOUNCE:
            mappedNews.push(await this.mapOnlineAnnounceNews(newsItem));
            break;
          case NewsTypes.ONLINE_RESULTS:
            mappedNews.push(await this.mapOnlineResultsNews(newsItem));
            break;
          case NewsTypes.MULTICUP_RESULTS:
            mappedNews.push(await this.mapMulticupResultsNews(newsItem));
            break;
          case NewsTypes.SIMPLE:
            mappedNews.push(await this.mapSimpleNews(newsItem));
            break;
        }

        if (index === news.length - 1) {
          resolve();
        }
      }),
    );

    return mappedNews;
  }

  private async mapOfflineStartNews(news: News, userAccess: UserAccessInterface): Promise<NewsOfflineStartInterface> {
    const baseNews: Omit<NewsInterface, 'type'> = await this.mapBaseNews(news);
    const cup: Cup = (await this.cupsRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where({ id: news.cup.id })
      .getOne())!;

    const levelshot = getMapLevelshot(news.cup.map1);
    const isFutureCup: boolean = moment(cup.start_datetime).isAfter(moment());
    let cpmDemo: string | null = null;
    let cpmRes: number | null = null;
    let vq3Demo: string | null = null;
    let vq3Res: number | null = null;
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
      cpmRes = bestCpmDemo?.time || null;
      vq3Demo = bestVq3Demo?.demopath || null;
      vq3Res = bestVq3Demo?.time || null;
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
    const levelshot: string = getMapLevelshot(news.cup.map1);
    const cup: Cup = (await this.cupsRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where({ id: news.cup.id })
      .getOne())!;

    const isFinishedCup: boolean = moment().isAfter(moment(news.cup.end_datetime));
    const emptyResults: ResultsTableInterface = { valid: [], invalid: [] };
    const cpmResults: ResultsTableInterface = isFinishedCup
      ? await this.getOfflineCupTable(cup, Physics.CPM)
      : emptyResults;
    const vq3Results: ResultsTableInterface = isFinishedCup
      ? await this.getOfflineCupTable(cup, Physics.VQ3)
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

  private async mapOnlineAnnounceNews(news: News): Promise<NewsOnlineAnnounceInterface> {
    return {} as any;
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
    return {} as any;
  }

  private async mapSimpleNews(news: News): Promise<NewsMulticupResultsInterface> {
    return {} as any;
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
      currentRound: news.cup.current_round,
      datetimezone: news.datetimezone,
      header: news.header,
      headerEn: news.header_en,
      image: news.image,
      cupId: news.cup.id,
      multicupId: news.cup.multicup?.id || null,
      startTime: news.cup.start_datetime,
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

  private async getOfflineCupTable(cup: Cup, physics: Physics): Promise<ResultsTableInterface> {
    const cupDemos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .leftJoinAndSelect('cups_demos.user', 'users')
      .leftJoinAndSelect('users.ratingChanges', 'rating_changes', 'cups_demos.cupId = rating_changes.cupId')
      .where('cups_demos.physics = :physics', { physics })
      .andWhere('cups_demos.cupId = :cupId', { cupId: cup.id })
      .getMany();

    const invalidDemos: InvalidDemoInterface[] = cupDemos
      .filter(({ verified_status }: CupDemo) => verified_status === VerifiedStatuses.INVALID)
      .map((cupDemo: CupDemo) => ({
        demopath: cupDemo.demopath,
        nick: cupDemo.user.displayed_nick,
        reason: cupDemo.reason,
        time: cupDemo.time,
      }));

    const validDemos: ValidDemoInterface[] = cupDemos
      .filter(
        ({ verified_status }: CupDemo) =>
          verified_status === VerifiedStatuses.VALID || verified_status === VerifiedStatuses.UNWATCHED,
      )
      .reduce((demos: ValidDemoInterface[], demo: CupDemo) => {
        const ratingChange: number | null =
          physics === Physics.CPM
            ? demo.user.ratingChanges[0]?.cpm_change || null
            : demo.user.ratingChanges[0]?.vq3_change || null;

        const mappedDemo: ValidDemoInterface = {
          bonus: demo.user.ratingChanges[0]?.bonus || null,
          change: ratingChange,
          country: demo.user.country,
          demopath: demo.demopath,
          impressive: demo.impressive,
          nick: demo.user.displayed_nick,
          playerId: demo.user.id,
          rating: physics === Physics.CPM ? demo.user.cpm_rating : demo.user.vq3_rating,
          time: demo.time,
        };

        const previousBestDemo: ValidDemoInterface | undefined = demos.find(
          ({ playerId }: ValidDemoInterface) => playerId === demo.user.id,
        );

        if (!previousBestDemo) {
          return [...demos, mappedDemo];
        }

        return previousBestDemo.time > mappedDemo.time
          ? [...demos.filter(({ playerId }: ValidDemoInterface) => playerId != demo.user.id), mappedDemo]
          : demos;
      }, [])
      .sort((demo1: ValidDemoInterface, demo2: ValidDemoInterface) => demo1.time - demo2.time);

    const result: ResultsTableInterface = {
      valid: validDemos,
      invalid: invalidDemos,
    };

    return result;
  }
}
