import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsType } from './entities/news-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News, NewsType])],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
