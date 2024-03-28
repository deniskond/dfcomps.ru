import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Multicup } from '../../../shared/entities/multicup.entity';
import { AdminMulticupsService } from './admin-multicups.service';
import { AdminMulticupsController } from './admin-multicups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Multicup])],
  controllers: [AdminMulticupsController],
  providers: [AdminMulticupsService],
})
export class AdminMulticupsModule {}
