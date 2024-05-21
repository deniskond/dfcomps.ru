import { Module } from '@nestjs/common';
import { Season } from '../../../shared/entities/season.entity';
import { User } from '../../../shared/entities/user.entity';
import { OldRating } from '../../../shared/entities/old-rating.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSeasonController } from './admin-season.controller';
import { AdminSeasonService } from './admin-season.service';
import { OneVOneRating } from 'apps/backend/src/shared/entities/1v1-rating.entity';
import { RatingChange } from 'apps/backend/src/shared/entities/rating-change.entity';
import { Cup } from 'apps/backend/src/shared/entities/cup.entity';
import { CupDemo } from 'apps/backend/src/shared/entities/cup-demo.entity';
import { CupResult } from 'apps/backend/src/shared/entities/cup-result.entity';
import { Multicup } from 'apps/backend/src/shared/entities/multicup.entity';
import { AuthRole } from 'apps/backend/src/shared/entities/auth-role.entity';
import { Reward } from 'apps/backend/src/shared/entities/reward.entity';
import { TablesService } from '../../tables/tables.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Season,
      User,
      OldRating,
      OneVOneRating,
      RatingChange,
      Cup,
      CupDemo,
      CupResult,
      Multicup,
      AuthRole,
      Reward,
    ]),
  ],
  controllers: [AdminSeasonController],
  providers: [AdminSeasonService, TablesService],
})
export class AdminSeasonModule {}
