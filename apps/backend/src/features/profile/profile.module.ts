import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Season } from '../../shared/entities/season.entity';
import { User } from '../../shared/entities/user.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { Reward } from '../../shared/entities/reward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Season, User, RatingChange, CupDemo, Reward])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
