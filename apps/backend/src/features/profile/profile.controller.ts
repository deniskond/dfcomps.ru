import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { NickChangeResponseInterface, ProfileInterface } from '@dfcomps/contracts';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  getPlayerProfile(@Param('id', new ParseIntPipe()) playerId: number): Promise<ProfileInterface> {
    return this.profileService.getPlayerProfile(playerId);
  }

  @Get('check_last_nick_change_time')
  checkLastNickChangeTime(@Headers('X-Auth') accessToken: string): Promise<NickChangeResponseInterface> {
    return this.profileService.checkLastNickChangeTime(accessToken);
  }

  @Post('update')
  @UseInterceptors(FileInterceptor('file'))
  updateProfile(
    @Headers('X-Auth') accessToken: string,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() { nick, country }: ProfileUpdateDto,
  ): Promise<void> {
    return this.profileService.updateProfile(accessToken, nick, country, avatar);
  }
}