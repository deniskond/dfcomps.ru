import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetDiscordTokenDto, GetPasswordTokenDto, TokenDto } from '@dfcomps/contracts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('get-password-token')
  getPasswordToken(@Body() getPasswordTokenDto: GetPasswordTokenDto): Promise<TokenDto> {
    return Promise.resolve({ token: '', roles: [] });
  }

  @Post('get-password-token')
  getDiscordToken(@Body() getDiscordTokenDto: GetDiscordTokenDto): Promise<TokenDto> {
    return Promise.resolve({ token: '', roles: [] });
  }

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
