import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '../../../shared/entities/news.entity';
import { AdminNewsService } from './admin-news.service';
import { AdminNewsController } from './admin-news.controller';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  controllers: [AdminNewsController],
  providers: [AdminNewsService],
})
export class AdminNewsModule {}
