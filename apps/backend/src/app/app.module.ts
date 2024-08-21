import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../shared/entities/user.entity';
import { Movie } from '../shared/entities/movie.entity';
import { AuthRole } from '../shared/entities/auth-role.entity';
import { OneVOneRating } from '../shared/entities/1v1-rating.entity';
import { AuthModule } from '../features/auth/auth.module';
import { CommentsModule } from '../features/comments/comments.module';
import { CupModule } from '../features/cup/cup.module';
import { MoviesModule } from '../features/movies/movies.module';
import { NewsModule } from '../features/news/news.module';
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
import { Match } from '../shared/entities/match.entity';
import { MatchModule } from '../features/match/match.module';
import { AdminModule } from '../features/admin/admin.module';
import { SeasonModule } from '../features/season/season.module';
import { MapSuggestion } from '../shared/entities/map-suggestion.entity';
import { WarcupAdminVote } from '../shared/entities/warcup-admin-vote.entity';
import { WarcupInfo } from '../shared/entities/warcup-info.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    SentryModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NODE_ENV === 'production' ? 'local_pgdb' : '127.0.0.1',
      port: 5432,
      username: 'user',
      password: process.env.DFCOMPS_POSTGRES_PASSWORD,
      entities: [
        User,
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
        Match,
        MapSuggestion,
        WarcupAdminVote,
        WarcupInfo,
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
    SeasonModule,
    ProfileModule,
    DemosModule,
    MatchModule,
    AdminModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
