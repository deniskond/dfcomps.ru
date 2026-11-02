import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { LoggerService } from '../../../shared/services/logger.service';
import { AdminAnticheatController } from './admin-anticheat.controller';
import { AdminAnticheatService } from './admin-anticheat.service';

@Module({
  imports: [TypeOrmModule.forFeature([CupDemo])],
  controllers: [AdminAnticheatController],
  providers: [AdminAnticheatService, LoggerService],
})
export class AdminAnticheatModule {}
