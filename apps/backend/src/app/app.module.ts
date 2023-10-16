import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../shared/entities/user.entity';
import { OldUser } from '../shared/entities/old-user.entity';
import { Movie } from '../shared/entities/movie.entity';
import { AuthRole } from '../shared/entities/auth-role.entity';
import { OneVOneRating } from '../shared/entities/1v1-rating.entity';
import { AuthModule } from '../features/auth/auth.module';
import { CommentsModule } from '../features/comments/comments.module';
import { CupModule } from '../features/cup/cup.module';
import { MoviesModule } from '../features/movies/movies.module';
import { NewsModule } from '../features/news/news.module';
import { RatingModule } from '../features/rating/rating.module';
import { TablesModule } from '../features/tables/tables.module';
import { CupDemo } from '../shared/entities/cup-demo.entity';
import { CupResult } from '../shared/entities/cup-result.entity';
import { Cup } from '../shared/entities/cup.entity';
import { Multicup } from '../shared/entities/multicup.entity';
import { NewsComment } from '../shared/entities/news-comment.entity';
import { NewsType } from '../shared/entities/news-type.entity';
import { News } from '../shared/entities/news.entity';
import { OldRating } from '../shared/entities/old-rating.entity';
import { RatingChange } from '../shared/entities/rating-change.entity';
import { Season } from '../shared/entities/season.entity';
import { Smile } from '../shared/entities/smile.entity';
import { ProfileModule } from '../features/profile/profile.module';
import { Reward } from '../shared/entities/reward.entity';
import { DemosModule } from '../features/demos/demos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NODE_ENV === 'production' ? 'local_pgdb' : '127.0.0.1',
      port: 5432,
      username: 'user',
      password: process.env.DFCOMPS_POSTGRES_PASSWORD,
      entities: [
        User,
        OldUser,
        Movie,
        AuthRole,
        OneVOneRating,
        Cup,
        News,
        CupResult,
        NewsType,
        Multicup,
        RatingChange,
        NewsComment,
        Smile,
        CupDemo,
        OldRating,
        Season,
        Reward,
      ],
      database: 'dfcomps',
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    MoviesModule,
    TablesModule,
    CupModule,
    NewsModule,
    CommentsModule,
    RatingModule,
    ProfileModule,
    DemosModule,
  ],
})
export class AppModule {}
