import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '../../shared/entities/season.entity';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Season]),
  ],
  controllers: [SeasonController],
  providers: [SeasonService],
})
export class SeasonModule {}
