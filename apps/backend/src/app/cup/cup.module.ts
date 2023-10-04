import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CupController } from './cup.controller';
import { Cup } from './entities/cup.entity';
import { CupService } from './cup.service';
import { News } from '../news/entities/news.entity';
import { CupResult } from './entities/cup-result.entity';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cup, News, CupResult])],
  controllers: [CupController],
  providers: [CupService, AuthService],
})
export class CupModule {}
