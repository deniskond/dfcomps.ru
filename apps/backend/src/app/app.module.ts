import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'admin',
      username: 'user',
      entities: [Auth],
      database: 'dfcomps',
      schema: 'dfcomps',
      synchronize: true,
      logging: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
