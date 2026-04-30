import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { AdminGeneralController } from './admin-general.controller';
import { AdminGeneralService } from './admin-general.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cup])],
  controllers: [AdminGeneralController],
  providers: [AdminGeneralService],
})
export class AdminGeneralModule {}
