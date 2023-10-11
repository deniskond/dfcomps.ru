import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsComment } from './entities/news-comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Smile } from './entities/smile.entity';
import { News } from '../news/entities/news.entity';
import { CupDemo } from '../cup/entities/cup-demo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsComment, Smile, News, CupDemo])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
