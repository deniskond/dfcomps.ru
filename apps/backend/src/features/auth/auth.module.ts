import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { User } from '../../shared/entities/user.entity';
import { OldUser } from '../../shared/entities/old-user.entity';
import { AuthRole } from '../../shared/entities/auth-role.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, OldUser, AuthRole]), HttpModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, HttpModule, TypeOrmModule.forFeature([User, OldUser, AuthRole])],
})
export class AuthModule {}
