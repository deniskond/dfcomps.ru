import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { AdminCupsController } from './admin-cups.controller';
import { AdminCupsService } from './admin-cups.service';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { TablesService } from '../../tables/tables.service';
import { OneVOneRating } from '../../../shared/entities/1v1-rating.entity';
import { RatingChange } from '../../../shared/entities/rating-change.entity';
import { Multicup } from '../../../shared/entities/multicup.entity';
import { CupResult } from '../../../shared/entities/cup-result.entity';
import { OldRating } from '../../../shared/entities/old-rating.entity';
import { Season } from '../../../shared/entities/season.entity';
import { News } from 'apps/backend/src/shared/entities/news.entity';
import { NewsComment } from 'apps/backend/src/shared/entities/news-comment.entity';
import { AdminWarcupsService } from './admin-warcups.service';
import { WarcupInfo } from 'apps/backend/src/shared/entities/warcup-info.entity';
import { MapSuggestion } from 'apps/backend/src/shared/entities/map-suggestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cup,
      CupDemo,
      OneVOneRating,
      RatingChange,
      Multicup,
      CupResult,
      OldRating,
      Season,
      News,
      NewsComment,
      WarcupInfo,
      MapSuggestion,
    ]),
  ],
  controllers: [AdminCupsController],
  providers: [AdminCupsService, TablesService, AdminWarcupsService],
})
export class AdminCupsModule {}
