import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { CupService } from './cup.service';
import { CheckCupRegistrationDto, CheckCupRegistrationInterface, CupInterface } from '@dfcomps/contracts';

@Controller('cup')
export class CupController {
  constructor(private readonly cupService: CupService) {}

  @Get('next-cup-info')
  nextCupInfo(@Headers('X-Auth') accessToken: string): Promise<CupInterface> {
    return this.cupService.getNextCupInfo(accessToken);
  }

  @Post('is-registered')
  checkIfPlayerRegistered(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CheckCupRegistrationDto,
  ): Promise<CheckCupRegistrationInterface> {
    return this.cupService.checkIfPlayerRegistered(accessToken, cupId);
  }
}
