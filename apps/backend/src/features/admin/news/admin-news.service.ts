import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../../shared/entities/news.entity';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { AuthService } from '../../auth/auth.service';
import {
  AdminEditNewsInterface,
  AdminNewsListInterface,
  AdminNewsDto,
  UploadedFileLinkInterface,
  NewsStreamInterface,
} from '@dfcomps/contracts';
import { mapNewsTypeEnumToDBNewsTypeId } from '../../../shared/mappers/news-types.mapper';
import { NewsComment } from '../../../shared/entities/news-comment.entity';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import * as moment from 'moment-timezone';
import { MulterFileInterface } from 'apps/backend/src/shared/interfaces/multer.interface';
import sharp = require('sharp');
import * as fs from 'fs';

@Injectable()
export class AdminNewsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    private readonly authService: AuthService,
  ) {}

  public async getAllNews(accessToken: string | undefined): Promise<AdminNewsListInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to get admin news list without NEWSMAKER role');
    }

    const news: News[] = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .orderBy('news.datetimezone', 'DESC')
      .addOrderBy('news.id', 'DESC')
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

    if (!checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to get admin news item without NEWSMAKER role');
    }

    const newsItem: News | null = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .leftJoinAndSelect('news.cup', 'cups')
      .where({ id: newsId })
      .getOne();

    if (!newsItem) {
      throw new NotFoundException(`News item with id = ${newsId} not found`);
    }

    let streams: NewsStreamInterface[] = [];

    try {
      streams = newsItem.streams ? JSON.parse(newsItem.streams) : [];
    } catch (e) {}

    return {
      newsItem: {
        headerRussian: newsItem.header,
        headerEnglish: newsItem.header_en,
        textRussian: newsItem.text,
        textEnglish: newsItem.text_en,
        typeName: newsItem.newsType.name_rus,
        date: newsItem.datetimezone,
        type: newsItem.newsType.name,
        cup: newsItem.cup ? { cupId: newsItem.cup.id, name: newsItem.cup.full_name } : null,
        multicupId: newsItem.multicup_id,
        imageLink: newsItem.image || null,
        streams,
      },
    };
  }

  public async postNews(accessToken: string | undefined, adminNewsDto: AdminNewsDto): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to post news list without NEWSMAKER role');
    }

    await this.newsRepository
      .createQueryBuilder()
      .insert()
      .into(News)
      .values([
        {
          header: adminNewsDto.russianTitle,
          header_en: adminNewsDto.englishTitle,
          text: adminNewsDto.russianText,
          text_en: adminNewsDto.englishText,
          user: { id: userAccess.userId },
          datetimezone: moment(adminNewsDto.postingTime).tz('Europe/Moscow').format(),
          newsType: { id: mapNewsTypeEnumToDBNewsTypeId(adminNewsDto.type) },
          comments_count: 0,
          hide_on_main: false,
          cup: adminNewsDto.cupId ? { id: Number(adminNewsDto.cupId) } : null,
          multicup_id: adminNewsDto.multicupId,
          streams: adminNewsDto.streams,
          image: adminNewsDto.imageLink || null,
        },
      ])
      .execute();
  }

  public async updateNews(accessToken: string | undefined, adminNewsDto: AdminNewsDto, newsId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to update news list without NEWSMAKER role');
    }

    const targetNews: News | null = await this.newsRepository.createQueryBuilder().where({ id: newsId }).getOne();

    if (!targetNews) {
      throw new BadRequestException(`No news with id = ${newsId}`);
    }

    const fullImagePath = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/images/news/${targetNews.image}.jpg`;

    if (targetNews.image && targetNews.image !== adminNewsDto.imageLink && fs.existsSync(fullImagePath)) {
      fs.rmSync(fullImagePath);
    }

    await this.newsRepository
      .createQueryBuilder()
      .update(News)
      .set({
        header: adminNewsDto.russianTitle,
        header_en: adminNewsDto.englishTitle,
        text: adminNewsDto.russianText,
        text_en: adminNewsDto.englishText,
        user: { id: userAccess.userId },
        datetimezone: moment(adminNewsDto.postingTime).tz('Europe/Moscow').format(),
        newsType: { id: mapNewsTypeEnumToDBNewsTypeId(adminNewsDto.type) },
        comments_count: 0,
        hide_on_main: false,
        cup: adminNewsDto.cupId ? { id: Number(adminNewsDto.cupId) } : null,
        multicup_id: adminNewsDto.multicupId,
        streams: adminNewsDto.streams,
        image: adminNewsDto.imageLink,
      })
      .where({ id: newsId })
      .execute();
  }

  public async deleteNews(accessToken: string | undefined, newsId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to delete news without NEWSMAKER role');
    }

    await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .delete()
      .from(NewsComment)
      .where({ news: { id: newsId } })
      .execute();

    await this.newsRepository.createQueryBuilder('news').delete().from(News).where({ id: newsId }).execute();
  }

  public async uploadNewsImage(
    accessToken: string | undefined,
    image: MulterFileInterface,
  ): Promise<UploadedFileLinkInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to upload news image without NEWSMAKER role');
    }

    const newsImageFileName = moment().format('x');

    const resizedImage: Buffer = await sharp(image.buffer)
      .resize(800)
      .jpeg()
      .toBuffer()
      .catch(() => {
        throw new InternalServerErrorException('Failed to resize image');
      });

    const relativePath = '/images/news/' + newsImageFileName + '.jpg';

    if (!fs.existsSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + '/images')) {
      fs.mkdirSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + '/images');
    }

    if (!fs.existsSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + '/images/news')) {
      fs.mkdirSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + '/images/news');
    }

    fs.writeFileSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + relativePath, resizedImage);

    return {
      link: newsImageFileName,
    };
  }
}
