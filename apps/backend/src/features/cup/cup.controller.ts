import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CupService } from './cup.service';
import {
  CheckCupRegistrationInterface,
  CupInterface,
  ArchiveLinkInterface,
  OnlineCupInfoInterface,
} from '@dfcomps/contracts';
import { CupRegistrationDto } from './dto/cup-registration.dto';

@Controller('cup')
export class CupController {
  constructor(private readonly cupService: CupService) {}

  @Get('next-cup-info')
  nextCupInfo(@Headers('X-Auth') accessToken: string | undefined): Promise<CupInterface> {
    return this.cupService.getNextCupInfo(accessToken);
  }

  @Post('is-registered')
  checkIfPlayerRegistered(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CupRegistrationDto,
  ): Promise<CheckCupRegistrationInterface> {
    return this.cupService.checkIfPlayerRegistered(accessToken, cupId);
  }

  @Get('validation-archive-link/:cupId')
  getValidationArchiveLink(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<ArchiveLinkInterface> {
    return this.cupService.getValidationArchiveLink(accessToken, cupId);
  }

  @Get('streamers-archive-link/:cupId')
  getStreamersArchiveLink(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<ArchiveLinkInterface> {
    return this.cupService.getStreamersArchiveLink(accessToken, cupId);
  }

  @Post('online/register')
  registerForOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CupRegistrationDto,
  ): Promise<void> {
    return this.cupService.registerForOnlineCup(accessToken, cupId);
  }

  @Post('online/cancel-registration')
  cancelRegistrationForOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CupRegistrationDto,
  ): Promise<void> {
    return this.cupService.cancelRegistrationForOnlineCup(accessToken, cupId);
  }

  @Get('online-cup/:cupId')
  getOnlineCupInfo(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<OnlineCupInfoInterface> {
    return this.cupService.getOnlineCupInfo(accessToken, cupId);
  }
}
