import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../../shared/entities/news.entity';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { AuthService } from '../../auth/auth.service';
import { AdminNewsInterface, UserRole } from '@dfcomps/contracts';

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
}
