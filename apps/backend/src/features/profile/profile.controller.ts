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
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { NickChangeResponseInterface, ProfileInterface } from '@dfcomps/contracts';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('get/:id')
  getPlayerProfile(@Param('id', new ParseIntPipe()) playerId: number): Promise<ProfileInterface> {
    return this.profileService.getPlayerProfile(playerId);
  }

  @Get('check_last_nick_change_time')
  checkLastNickChangeTime(@Headers('X-Auth') accessToken: string): Promise<NickChangeResponseInterface> {
    return this.profileService.checkLastNickChangeTime(accessToken);
  }

  @Post('update-info')
  updateProfileInfo(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { nick, country }: ProfileUpdateDto,
  ): Promise<void> {
    return this.profileService.updateProfileInfo(accessToken, nick, country);
  }

  @Post('update-avatar')
  @UseInterceptors(FileInterceptor('file'))
  updateProfileAvatar(
    @Headers('X-Auth') accessToken: string | undefined,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpg|png|gif|jpeg/,
        })
        .addMaxSizeValidator({
          maxSize: 5000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    avatar: Express.Multer.File,
  ): Promise<void> {
    return this.profileService.updateProfileAvatar(accessToken, avatar);
  }
}
