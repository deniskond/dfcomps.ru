import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '../../../shared/entities/news.entity';
import { AdminNewsService } from './admin-news.service';
import { AdminNewsController } from './admin-news.controller';
import { NewsComment } from '../../../shared/entities/news-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News, NewsComment])],
  controllers: [AdminNewsController],
  providers: [AdminNewsService],
})
export class AdminNewsModule {}
