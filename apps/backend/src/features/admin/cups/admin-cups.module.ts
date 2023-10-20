import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { AdminCupsController } from './admin-cups.controller';
import { AdminCupsService } from './admin-cups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cup])],
  controllers: [AdminCupsController],
  providers: [AdminCupsService],
})
export class AdminCupsModule {}
