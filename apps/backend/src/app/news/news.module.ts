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
import { Cup } from '../cup/entities/cup.entity';
import { CupDemo } from '../cup/entities/cup-demo.entity';
import { TablesService } from '../tables/tables.service';
import { OneVOneRating } from '../tables/entities/1v1-rating.entity';
import { OldRating } from '../tables/entities/old-rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      News,
      NewsType,
      Cup,
      CupResult,
      Multicup,
      RatingChange,
      NewsComment,
      CupDemo,
      OneVOneRating,
      OldRating,
    ]),
  ],
  controllers: [NewsController],
  providers: [NewsService, TablesService],
})
export class NewsModule {}
