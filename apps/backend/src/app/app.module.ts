import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'user',
      password: process.env.DFCOMPS_POSTGRES_PASSWORD,
      entities: [Auth],
      database: 'dfcomps',
      synchronize: true,
      logging: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
