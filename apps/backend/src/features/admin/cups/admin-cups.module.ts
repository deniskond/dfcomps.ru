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

@Module({
  imports: [
    TypeOrmModule.forFeature([Cup, CupDemo, OneVOneRating, RatingChange, Multicup, CupResult, OldRating, Season, News]),
  ],
  controllers: [AdminCupsController],
  providers: [AdminCupsService, TablesService],
})
export class AdminCupsModule {}
