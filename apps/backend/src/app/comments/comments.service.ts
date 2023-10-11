import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsComment } from './entities/news-comment.entity';
import { CommentActionResultInterface, CommentInterface, PersonalSmileInterface } from '@dfcomps/contracts';
import { Smile } from './entities/smile.entity';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../interfaces/user-access.interface';
import { News } from '../news/entities/news.entity';
import * as moment from 'moment';
import { CupDemo } from '../cup/entities/cup-demo.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Smile) private readonly smilesRepository: Repository<Smile>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    private readonly authService: AuthService,
  ) {}

  public async getPersonalSmiles(): Promise<PersonalSmileInterface[]> {
    const allSmiles: Smile[] = await this.smilesRepository
      .createQueryBuilder('smiles')
      .leftJoinAndSelect('smiles.user', 'users')
      .where('smiles.userId IS NOT NULL')
      .getMany();

    return allSmiles.map((smile: Smile) => ({
      playerId: smile.user?.id || null,
      smileAlias: smile.alias,
    }));
  }

  public async addComment(accessToken: string, text: string, newsId: number): Promise<CommentInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException('Cannot post as anonymous user');
    }

    if (moment(userAccess.commentsBanDate).isAfter(moment())) {
      throw new BadRequestException(`Comments banned until ${userAccess.commentsBanDate}`);
    }

    const news: News | null = await this.newsRepository.createQueryBuilder('news').where({ id: newsId }).getOne();

    if (!news) {
      throw new NotFoundException(`News with id = ${newsId} not found`);
    }

    const isCorrectTime: boolean = moment(news.datetimezone).isBefore(moment());

    if (!isCorrectTime) {
      throw new BadRequestException("Can't add comment before posting time");
    }

    const amountOfCompetitions: number = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .distinct()
      .select('cupId')
      .where('cups_demos.userId = :userId', { userId: userAccess.userId })
      .getCount();

    if (amountOfCompetitions < 3) {
      throw new BadRequestException("Can't post comments before participating in 3 competitions");
    }

    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new BadRequestException('Comment is empty');
    }

    await this.newsCommentsRepository
      .createQueryBuilder()
      .insert()
      .into(NewsComment)
      .values([
        {
          comment: trimmedText,
          datetime: null,
          datetimezone: moment().format(),
          reason: '',
          user: { id: userAccess.userId },
          news: { id: newsId },
        },
      ])
      .execute();


    const updatedComments: NewsComment[] = await this.newsCommentsRepository
      .createQueryBuilder('news_comments')
      .leftJoinAndSelect('news_comments.user', 'users')
      .where('news_comments.newsId = :newsId', { newsId })
      .getMany();

    return updatedComments.map((newsComment: NewsComment) => ({
      commentId: newsComment.id,
      comment: newsComment.comment,
      datetimezone: newsComment.datetimezone,
      playerId: newsComment.user.id,
      reason: newsComment.reason,
      username: newsComment.user.displayed_nick,
    }));
  }

  public async deleteComment(commentId: number): Promise<CommentActionResultInterface> {
    return {} as any;
  }

  public async updateComment(text: string, commentId: number): Promise<CommentActionResultInterface> {
    return {} as any;
  }

  public async adminDeleteComment(accessToken: string, commentId: number): Promise<CommentInterface[]> {
    return {} as any;
  }
}
