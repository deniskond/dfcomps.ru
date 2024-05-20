import { SeasonNumberInterface } from '@dfcomps/contracts';
import { Controller, Get } from '@nestjs/common';
import { SeasonService } from './season.service';

@Controller('season')
export class SeasonController {
  constructor(private seasonService: SeasonService) {}

  @Get('get-season')
  async getSeason(): Promise<SeasonNumberInterface> {
    return this.seasonService.getSeason();
  }
}
