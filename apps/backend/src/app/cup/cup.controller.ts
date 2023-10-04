import { Controller, Get, Headers } from '@nestjs/common';
import { CupService } from './cup.service';
import { CupInterface } from '@dfcomps/contracts';

@Controller('cup')
export class CupController {
  constructor(private readonly cupService: CupService) {}

  @Get('next-cup-info')
  nextCupInfo(@Headers('X-Auth') accessToken: string): Promise<CupInterface> {
    return this.cupService.getNextCupInfo(accessToken);
  }
}
