import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingController } from './rating.controller';
import { Season } from '../../shared/entities/season.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  controllers: [RatingController],
})
export class RatingModule {}
