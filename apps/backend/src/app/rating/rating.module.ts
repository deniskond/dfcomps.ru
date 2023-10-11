import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './entities/season.entity';
import { RatingController } from './rating.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  controllers: [RatingController],
})
export class RatingModule {}
