import { Controller, Get } from '@nestjs/common';
import { CupService } from './cup.service';
import { CupInterface } from '@dfcomps/contracts';

@Controller('cup')
export class CupController {
  constructor(private readonly cupService: CupService) {}

  @Get('next-cup-info')
  nextCupInfo(): Promise<CupInterface> {
    return this.cupService.getNextCupInfo();
  }
}
