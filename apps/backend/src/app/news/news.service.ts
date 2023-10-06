import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import {
  NewsInterfaceUnion,
  NewsMulticupResultsInterface,
  NewsOfflineResultsInterface,
  NewsOfflineStartInterface,
  NewsOnlineAnnounceInterface,
  NewsOnlineResultsInterface,
  NewsTypes,
  UserRole,
} from '@dfcomps/contracts';
import { UserAccessInterface } from '../interfaces/user-access.interface';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { CupResult } from '../cup/entities/cup-result.entity';
import { mapCupEntityToInterface } from '../mappers/cup.mapper';
import { NewsComment } from './entities/news-comment.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(CupResult) private readonly cupsResultsRepository: Repository<CupResult>,
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
      .orderBy('news.datetimezone', 'DESC')
      .addOrderBy('news_types.id', 'ASC')
      .where('news.datetimezone < :targetTime', { targetTime })
      .andWhere('news.hide_on_main = :hideOnMain', { hideOnMain: false })
      .andWhere({ newsType: { name: 'online_results' } }) // test
      .limit(10)
      .getMany();

    // return news as any;

    const mappedNews: NewsInterfaceUnion[] = [];

    await new Promise<void>((resolve) =>
      news.forEach(async (newsItem: News, index: number) => {
        switch (newsItem.newsType.name) {
          case NewsTypes.OFFLINE_START:
            mappedNews.push(await this.mapOfflineStartNews(newsItem));
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

  private async mapOfflineStartNews(news: News): Promise<NewsOfflineStartInterface> {
    return {} as any;
  }

  private async mapOfflineResultsNews(news: News): Promise<NewsOfflineResultsInterface> {
    return {} as any;
  }

  private async mapOnlineAnnounceNews(news: News): Promise<NewsOnlineAnnounceInterface> {
    return {} as any;
  }

  private async mapOnlineResultsNews(news: News): Promise<NewsOnlineResultsInterface> {
    const cupResults: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'user')
      .leftJoinAndSelect('user.ratingChanges', 'rating_changes', 'cups_results.cupId = rating_changes.cupId')
      .where({ cup: { id: news.cup.id } })
      .orderBy('final_sum', 'DESC')
      .addOrderBy('displayed_nick', 'ASC')
      .getMany();

    const comments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'user')
      .where({ news: { id: news.id } })
      .orderBy('news_comments.id', 'ASC')
      .getMany();

    const preposted: boolean = moment(news.datetimezone).isAfter(moment());

    return {
      type: NewsTypes.ONLINE_RESULTS,
      id: news.id,
      authorId: news.user.id,
      authorName: news.user.displayed_nick,
      currentRound: news.cup.current_round,
      datetimezone: news.datetimezone,
      header: news.header,
      headerEn: news.header_en,
      image: news.image,
      cupId: news.cup.id,
      multicupId: news.cup.multicup_id,
      startTime: news.cup.start_datetime,
      text: news.text,
      textEn: news.text_en,
      youtube: news.youtube,
      tableJson: news.table_json,
      twitch1: news.twitch_1,
      twitch2: news.twitch_2,
      comments: comments.map((newsComment: NewsComment) => ({
        comment: newsComment.comment,
        datetimezone: newsComment.datetimezone,
        playerId: newsComment.user.id,
        reason: newsComment.reason,
        username: newsComment.user.displayed_nick,
      })),
      preposted,
      cup: mapCupEntityToInterface(news.cup, false, null, news.id),
      results: cupResults.map((cupResult: CupResult) => ({
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
}
