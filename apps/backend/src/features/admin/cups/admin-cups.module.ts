import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { AdminCupsController } from './admin-cups.controller';
import { AdminCupsService } from './admin-cups.service';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cup, CupDemo])],
  controllers: [AdminCupsController],
  providers: [AdminCupsService],
})
export class AdminCupsModule {}
