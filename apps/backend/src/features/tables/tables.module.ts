import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { User } from '../../shared/entities/user.entity';
import { OneVOneRating } from '../../shared/entities/1v1-rating.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { OldRating } from '../../shared/entities/old-rating.entity';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { Multicup } from '../../shared/entities/multicup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OneVOneRating, RatingChange, Cup, CupDemo, OldRating, CupResult, Multicup]),
  ],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
