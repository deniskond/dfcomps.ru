import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { TablesService } from '../tables/tables.service';
import { News } from '../../shared/entities/news.entity';
import { NewsType } from '../../shared/entities/news-type.entity';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { Multicup } from '../../shared/entities/multicup.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import { NewsComment } from '../../shared/entities/news-comment.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { OneVOneRating } from '../../shared/entities/1v1-rating.entity';
import { OldRating } from '../../shared/entities/old-rating.entity';

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
      OneVOneRating, // excessive dependency
      OldRating, // excessive dependency
    ]),
  ],
  controllers: [NewsController],
  providers: [NewsService, TablesService],
})
export class NewsModule {}
