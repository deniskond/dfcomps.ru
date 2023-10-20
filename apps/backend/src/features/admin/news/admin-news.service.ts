import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../../shared/entities/news.entity';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { AuthService } from '../../auth/auth.service';
import { AdminEditNewsInterface, AdminNewsListInterface, PostNewsDto, UserRole } from '@dfcomps/contracts';
import { mapNewsTypeEnumToDBNewsTypeId } from '../../../shared/mappers/news-types.mapper';

@Injectable()
export class AdminNewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    private readonly authService: AuthService,
  ) {}

  public async getAllNews(accessToken: string | undefined): Promise<AdminNewsListInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.roles.includes(UserRole.NEWSMAKER)) {
      throw new UnauthorizedException('Unauthorized to get admin news list without NEWSMAKER role');
    }

    const news: News[] = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .orderBy('news.datetimezone', 'DESC')
      .addOrderBy('news.newsTypeId', 'ASC')
      .getMany();

    return news.map((newsItem: News) => ({
      id: newsItem.id,
      headerRussian: newsItem.header,
      headerEnglish: newsItem.header_en,
      textRussian: newsItem.text,
      textEnglish: newsItem.text_en,
      typeName: newsItem.newsType.name_rus,
      date: newsItem.datetimezone,
      type: newsItem.newsType.name,
    }));
  }

  public async getSingleNews(accessToken: string | undefined, newsId: number): Promise<AdminEditNewsInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.roles.includes(UserRole.NEWSMAKER)) {
      throw new UnauthorizedException('Unauthorized to get admin news list without NEWSMAKER role');
    }

    const newsItem: News | null = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .where({ id: newsId })
      .getOne();

    if (!newsItem) {
      throw new NotFoundException(`News item with id = ${newsId} not found`);
    }

    return {
      newsItem: {
        headerRussian: newsItem.header,
        headerEnglish: newsItem.header_en,
        textRussian: newsItem.text,
        textEnglish: newsItem.text_en,
        typeName: newsItem.newsType.name_rus,
        date: newsItem.datetimezone,
        type: newsItem.newsType.name,
        youtube: newsItem.youtube,
      },
    };
  }

  public async postNews(accessToken: string | undefined, postNewsDto: PostNewsDto): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !userAccess.roles.includes(UserRole.NEWSMAKER)) {
      throw new UnauthorizedException('Unauthorized to get admin news list without NEWSMAKER role');
    }

    await this.newsRepository
      .createQueryBuilder()
      .insert()
      .into(News)
      .values([
        {
          header: postNewsDto.russianTitle,
          header_en: postNewsDto.englishTitle,
          text: postNewsDto.russianText,
          text_en: postNewsDto.englishText,
          youtube: postNewsDto.youtube,
          user: { id: userAccess.userId },
          datetimezone: postNewsDto.postingTime,
          newsType: { id: mapNewsTypeEnumToDBNewsTypeId(postNewsDto.type) },
          comments_count: 0,
          hide_on_main: false,
        },
      ])
      .execute();
  }

  public async updateNews(accessToken: string | undefined, postNewsDto: PostNewsDto, newsId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !userAccess.roles.includes(UserRole.NEWSMAKER)) {
      throw new UnauthorizedException('Unauthorized to get admin news list without NEWSMAKER role');
    }

    await this.newsRepository
      .createQueryBuilder()
      .update(News)
      .set({
        header: postNewsDto.russianTitle,
        header_en: postNewsDto.englishTitle,
        text: postNewsDto.russianText,
        text_en: postNewsDto.englishText,
        youtube: postNewsDto.youtube,
        user: { id: userAccess.userId },
        datetimezone: postNewsDto.postingTime,
        newsType: { id: mapNewsTypeEnumToDBNewsTypeId(postNewsDto.type) },
        comments_count: 0,
        hide_on_main: false,
      })
      .where({ id: newsId })
      .execute();
  }
}
