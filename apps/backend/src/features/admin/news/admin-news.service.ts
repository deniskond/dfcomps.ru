import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../../shared/entities/news.entity';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { AuthService } from '../../auth/auth.service';
import { AdminNewsInterface, PostNewsDto, UserRole } from '@dfcomps/contracts';
import { mapNewsTypeEnumToDBNewsTypeId } from '../../../shared/mappers/news-types.mapper';

@Injectable()
export class AdminNewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    private readonly authService: AuthService,
  ) {}

  public async getAllNews(accessToken: string | undefined): Promise<AdminNewsInterface[]> {
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
}
