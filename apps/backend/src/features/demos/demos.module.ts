import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemosController } from './demos.controller';
import { DemosService } from './demos.service';
import { Cup } from '../../shared/entities/cup.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { Match } from '../../shared/entities/match.entity';
import { LoggerService } from '../../shared/services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cup, CupDemo, Match])],
  controllers: [DemosController],
  providers: [DemosService, LoggerService],
})
export class DemosModule {}
