import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { User } from '../../../shared/entities/user.entity';
import { LoggerService } from '../../../shared/services/logger.service';
import { AdminAnticheatController } from './admin-anticheat.controller';
import { AdminAnticheatService } from './admin-anticheat.service';

@Module({
  imports: [TypeOrmModule.forFeature([CupDemo, User])],
  controllers: [AdminAnticheatController],
  providers: [AdminAnticheatService, LoggerService],
})
export class AdminAnticheatModule {}
