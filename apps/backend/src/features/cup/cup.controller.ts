import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CupService } from './cup.service';
import { CheckCupRegistrationInterface, CupInterface, ArchiveLinkInterface } from '@dfcomps/contracts';
import { CheckCupRegistrationDto } from './dto/check-cup-registration.dto';

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
    @Body() { cupId }: CheckCupRegistrationDto,
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
}
