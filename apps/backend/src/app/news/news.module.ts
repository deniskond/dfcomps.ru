import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsType } from './entities/news-type.entity';
import { CupResult } from '../cup/entities/cup-result.entity';
import { Multicup } from '../cup/entities/multicup.entity';
import { RatingChange } from './entities/rating-change.entity';
import { NewsComment } from '../comments/entities/news-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News, NewsType, CupResult, Multicup, RatingChange, NewsComment])],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
