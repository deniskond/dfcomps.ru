import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OldUser } from './entities/old-user.entity';
import { AuthRole } from './entities/auth-role.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, OldUser, AuthRole]), HttpModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, HttpModule, TypeOrmModule.forFeature([User, OldUser, AuthRole])],
})
export class AuthModule {}
