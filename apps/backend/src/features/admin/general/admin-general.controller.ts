import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AdminGeneralService } from './admin-general.service';
import { AdminTimerCupInterface, SetTimerCupDto } from '@dfcomps/contracts';

@Controller('admin/general')
export class AdminGeneralController {
  constructor(private readonly adminGeneralService: AdminGeneralService) {}

  @Get('get-timer-cup')
  getTimerCup(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminTimerCupInterface> {
    return this.adminGeneralService.getTimerCup(accessToken);
  }

  @Post('set-timer-cup')
  setTimerCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: SetTimerCupDto,
  ): Promise<void> {
    return this.adminGeneralService.setTimerCup(accessToken, cupId);
  }
}
