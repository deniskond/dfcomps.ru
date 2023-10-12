import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetPasswordTokenDto } from './dto/get-password-token.dto';
import { GetDiscordTokenDto } from './dto/get-discord-token.dto';
import { LoginAvailableDto } from './dto/login-available.dto';
import { CheckLoginDto } from './dto/check-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('get-password-token')
  getPasswordToken(@Body() { login, password }: GetPasswordTokenDto): Promise<LoginResponseDto> {
    return this.authService.getPasswordToken(login, password);
  }

  @Post('get-discord-token')
  getDiscordToken(@Body() { discordAccessToken }: GetDiscordTokenDto): Promise<LoginResponseDto> {
    return this.authService.getDiscordToken(discordAccessToken);
  }

  @Post('check-login')
  checkLogin(@Body() { login }: CheckLoginDto): Promise<LoginAvailableDto> {
    return this.authService.checkLogin(login);
  }

  @Post('register')
  register(@Body() { login, discordAccessToken }: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.register(login, discordAccessToken);
  }

  // TODO Delete after release
  @Post('convert-table')
  convertTable() {
    return this.authService.convertTable();
  }
}
