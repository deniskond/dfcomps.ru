import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OldUser } from './entities/old-user.entity';
import { AuthRole } from './entities/auth-role.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([User, OldUser, AuthRole]), HttpModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
