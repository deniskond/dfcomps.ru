import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { User } from '../auth/entities/user.entity';
import { OneVOneRating } from './entities/1v1-rating.entity';
import { RatingChange } from '../news/entities/rating-change.entity';
import { CupDemo } from '../cup/entities/cup-demo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, OneVOneRating, RatingChange, CupDemo])],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
