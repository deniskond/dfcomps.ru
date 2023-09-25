import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';
import { MoviesModule } from './movies/movies.module';
import { Movie } from './movies/entities/movie.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NODE_ENV === 'production' ? 'local_pgdb' : '127.0.0.1',
      port: 5432,
      username: 'user',
      password: process.env.DFCOMPS_POSTGRES_PASSWORD,
      entities: [Auth, Movie],
      database: 'dfcomps',
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    MoviesModule,
  ],
})
export class AppModule {}
