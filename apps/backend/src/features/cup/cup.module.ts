import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CupController } from './cup.controller';
import { CupService } from './cup.service';
import { AuthService } from '../auth/auth.service';
import { News } from '../../shared/entities/news.entity';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cup, News, CupResult])],
  controllers: [CupController],
  providers: [CupService, AuthService],
})
export class CupModule {}
