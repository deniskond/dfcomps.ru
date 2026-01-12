import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Multicup } from '../../../shared/entities/multicup.entity';
import { AdminMulticupsService } from './admin-multicups.service';
import { AdminMulticupsController } from './admin-multicups.controller';
import { TablesService } from '../../tables/tables.service';
import { OneVOneRating } from '../../../shared/entities/1v1-rating.entity';
import { Cup } from '../../../shared/entities/cup.entity';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { RatingChange } from '../../../shared/entities/rating-change.entity';
import { CupResult } from '../../../shared/entities/cup-result.entity';
import { OldRating } from '../../../shared/entities/old-rating.entity';
import { Season } from '../../../shared/entities/season.entity';
import { User } from '../../../shared/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Multicup,
      OneVOneRating,
      Cup,
      CupDemo,
      OneVOneRating,
      RatingChange,
      CupResult,
      OldRating,
      Season,
      User,
    ]),
  ],
  controllers: [AdminMulticupsController],
  providers: [AdminMulticupsService, TablesService],
})
export class AdminMulticupsModule {}
