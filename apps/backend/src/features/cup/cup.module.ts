import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CupController } from './cup.controller';
import { CupService } from './cup.service';
import { AuthService } from '../auth/auth.service';
import { News } from '../../shared/entities/news.entity';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { TablesService } from '../tables/tables.service';
import { User } from '../../shared/entities/user.entity';
import { OneVOneRating } from '../../shared/entities/1v1-rating.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { OldRating } from '../../shared/entities/old-rating.entity';
import { Multicup } from '../../shared/entities/multicup.entity';
import { MapSuggestion } from '../../shared/entities/map-suggestion.entity';
import { WorldspawnParseService } from '../../shared/services/worldspawn-parse.service';
import { LevelshotsService } from '../../shared/services/levelshots.service';
import { CupReview } from '../../shared/entities/cups-reviews.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cup,
      News,
      CupResult,
      User,
      OneVOneRating,
      RatingChange,
      CupDemo,
      OldRating,
      Multicup,
      MapSuggestion,
      CupReview,
    ]),
  ],
  controllers: [CupController],
  providers: [CupService, AuthService, TablesService, WorldspawnParseService, LevelshotsService],
})
export class CupModule {}
