import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { NewsComment } from '../../shared/entities/news-comment.entity';
import { Smile } from '../../shared/entities/smile.entity';
import { News } from '../../shared/entities/news.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsComment, Smile, News, CupDemo])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
