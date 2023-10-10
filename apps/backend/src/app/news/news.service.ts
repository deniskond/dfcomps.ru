import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import {
  InvalidDemoInterface,
  MulticupResultInterface,
  MulticupSystems,
  NewsInterface,
  NewsInterfaceUnion,
  NewsMulticupResultsInterface,
  NewsOfflineResultsInterface,
  NewsOfflineStartInterface,
  NewsOnlineAnnounceInterface,
  NewsOnlineResultsInterface,
  NewsSimpleInterface,
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
import { Multicup } from '../cup/entities/multicup.entity';
import { RatingChange } from './entities/rating-change.entity';

type MultiCupTableWithPoints = {
  valid: (ValidDemoInterface & { eePoints: number })[];
  invalid: InvalidDemoInterface[];
};

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupsResultsRepository: Repository<CupResult>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(Multicup) private readonly multicupRepository: Repository<Multicup>,
    @InjectRepository(RatingChange) private readonly ratingChangeRepository: Repository<RatingChange>,
    private readonly authService: AuthService,
  ) {}

  public async getAllThemeNews(accessToken: string, theme: string): Promise<NewsInterfaceUnion[]> {
    return {} as any;
  }

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
      .andWhere({ newsType: { name: NewsTypes.ONLINE_ANNOUNCE } }) // test
      // .andWhere('news.multicup_id = 11') // test
      .limit(1) // 10
      .getMany();

    return await Promise.all(
      news.map((newsItem: News) => {
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
        }
      }),
    );
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

    const vq3Results: MulticupResultInterface[] = await this.getMulticupTable(
      news.multicup_id,
      cups,
      Physics.VQ3,
      multicup.system,
    );
    const cpmResults: MulticupResultInterface[] = await this.getMulticupTable(
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

  private async getMulticupTable(
    multicupId: number,
    cups: Cup[],
    physics: Physics,
    system: MulticupSystems,
  ): Promise<MulticupResultInterface[]> {
    const singleCupTables: ResultsTableInterface[] = await Promise.all(
      cups.map((cup: Cup) => this.getOfflineCupTable(cup, physics)),
    );

    const tablesWithPoints: MultiCupTableWithPoints[] =
      system === MulticupSystems.SDC
        ? await this.getSdcMulticupTable(singleCupTables)
        : await this.getEEMulticupTable(singleCupTables, system);

    // results without subtraction of min round and rating changes
    let multicupResults: MulticupResultInterface[] = [];

    tablesWithPoints.forEach((table: MultiCupTableWithPoints, roundIndex: number) => {
      table.valid.forEach((result: ValidDemoInterface & { eePoints: number }) => {
        const playerRecordIndex: number = multicupResults.findIndex(
          (playerRecord: MulticupResultInterface) => playerRecord.playerId === result.playerId,
        );

        if (playerRecordIndex !== -1) {
          multicupResults[playerRecordIndex].roundResults[roundIndex] = result.eePoints;
          multicupResults[playerRecordIndex].overall += result.eePoints;
        } else {
          const roundResults: number[] = [];

          roundResults[roundIndex] = result.eePoints;

          multicupResults.push({
            playerId: result.playerId,
            playerNick: result.nick,
            playerCountry: result.country,
            roundResults,
            overall: result.eePoints,
            minround: null, // is mapped after
            ratingChange: null, // is mapped after
          });
        }
      });
    });

    if ((system === MulticupSystems.EE_ALMERA || system === MulticupSystems.EE_KOZ) && singleCupTables.length > 3) {
      multicupResults = this.subtractMinRound(multicupResults);
    }

    multicupResults = await this.mapRatingChanges(multicupResults, multicupId, physics);

    return multicupResults.sort((a: MulticupResultInterface, b: MulticupResultInterface) => b.overall - a.overall);
  }

  private subtractMinRound(multicupResults: MulticupResultInterface[]): MulticupResultInterface[] {
    return multicupResults.map((multicupResult: MulticupResultInterface) => {
      let minRoundResult: number = Infinity;
      let minRoundIndex: number | null = null;

      multicupResult.roundResults.forEach((result: number | null, index: number) => {
        if (result !== null && result < minRoundResult) {
          minRoundResult = result;
          minRoundIndex = index;
        }
      });

      return {
        ...multicupResult,
        overall: multicupResult.overall - minRoundResult,
        minround: minRoundIndex === null ? null : minRoundIndex + 1,
      };
    });
  }

  private async mapRatingChanges(
    multicupResults: MulticupResultInterface[],
    multicupId: number,
    physics: Physics,
  ): Promise<MulticupResultInterface[]> {
    const ratingChanges: RatingChange[] = await this.ratingChangeRepository
      .createQueryBuilder('rating_changes')
      .leftJoinAndSelect('rating_changes.user', 'users')
      .where('rating_changes.multicupId = :multicupId', { multicupId })
      .getMany();

    return multicupResults.map((multicupResult: MulticupResultInterface) => {
      const playerRatingChangeRecord: RatingChange | undefined = ratingChanges.find(
        (ratingChange: RatingChange) => ratingChange.user.id === multicupResult.playerId,
      );
      let ratingChange: number | null = null;

      if (playerRatingChangeRecord) {
        ratingChange =
          physics === Physics.CPM ? playerRatingChangeRecord.cpm_change : playerRatingChangeRecord.vq3_change;
      }

      return { ...multicupResult, ratingChange };
    });
  }

  private async getSdcMulticupTable(singleCupTables: ResultsTableInterface[]): Promise<MultiCupTableWithPoints[]> {
    return singleCupTables.map((table: ResultsTableInterface) => {
      const topTime: number = table.valid[0].time;

      return {
        valid: table.valid.map((validDemo: ValidDemoInterface) => {
          let eePoints = Number((20 - (validDemo.time - topTime)).toFixed(3));

          if (eePoints < 0) {
            eePoints = 0;
          }

          return { ...validDemo, eePoints };
        }),
        invalid: table.invalid,
      };
    });
  }

  private async getEEMulticupTable(
    singleCupTables: ResultsTableInterface[],
    system: MulticupSystems,
  ): Promise<MultiCupTableWithPoints[]> {
    return singleCupTables.map((table: ResultsTableInterface) => {
      const topTime: number = table.valid[0].time;
      let currentPlace = 1;

      return {
        valid: table.valid.map((validDemo: ValidDemoInterface, index: number) => {
          let eePoints: number;

          if (index === 0) {
            eePoints = 1000;
          } else {
            if (table.valid[index].time !== table.valid[index - 1].time) {
              currentPlace++;
            }

            const k1 = topTime / validDemo.time;
            const k2 = this.countK2(currentPlace, system);

            eePoints = Math.round(k1 * k2 * 1000);
          }

          return {
            ...validDemo,
            eePoints,
          };
        }),
        invalid: [],
      };
    });
  }

  private countK2(place: number, system: MulticupSystems): number {
    let k2: number;

    if (system === MulticupSystems.EE_ALMERA) {
      if (place === 1) {
        k2 = 1;
      } else if (place === 2) {
        k2 = 0.97;
      } else if (place === 3) {
        k2 = 0.94;
      } else if (place === 4) {
        k2 = 0.92;
      } else if (place === 5) {
        k2 = 0.9;
      } else if (place <= 50) {
        k2 = 0.9 - (place - 5) / 100;
      } else if (place <= 100) {
        k2 = 0.9 - 45 / 100 - (place - 50) / 200;
      } else {
        k2 = 0.9 - 45 / 100 - (100 - 50) / 200 - (place - 100) / 400;
      }

      if (k2 <= 0.01) {
        k2 = 0.01;
      }

      return k2;
    } else if (system === MulticupSystems.EE_KOZ) {
      if (place === 1) {
        k2 = 1;
      } else if (place === 2) {
        k2 = 0.98;
      } else if (place === 3) {
        k2 = 0.965;
      } else if (place === 4) {
        k2 = 0.953;
      } else if (place === 5) {
        k2 = 0.942;
      } else if (place <= 50) {
        k2 = 0.942 - (place - 5) / 100;
      } else if (place <= 100) {
        k2 = 0.942 - 45 / 100 - (place - 50) / 200;
      } else {
        k2 = 0.942 - 45 / 100 - (100 - 50) / 200 - (place - 100) / 400;
      }

      if (k2 <= 0.01) {
        k2 = 0.01;
      }

      return k2;
    } else if (system === MulticupSystems.EE_DFWC) {
      if (place === 1) {
        k2 = 1;
      } else if (place === 2) {
        k2 = 0.99;
      } else if (place === 3) {
        k2 = 0.98;
      } else if (place === 4) {
        k2 = 0.97;
      } else if (place === 5) {
        k2 = 0.96;
      } else if (place <= 50) {
        k2 = 0.96 - (place - 5) / 100;
      } else if (place <= 100) {
        k2 = 0.96 - 45 / 100 - (place - 50) / 200;
      } else {
        k2 = 0.96 - 45 / 100 - (100 - 50) / 200 - (place - 100) / 400;
      }

      if (k2 <= 0.01) {
        k2 = 0.01;
      }

      return k2;
    }

    return 0;
  }
}
