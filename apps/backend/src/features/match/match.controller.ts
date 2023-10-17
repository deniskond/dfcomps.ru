import { Controller, Get, Headers } from '@nestjs/common';
import { MatchService } from './match.service';
import { DuelPlayersInfoResponseInterface } from '@dfcomps/contracts';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  getMatchInfo(@Headers('X-Auth') accessToken: string): Promise<DuelPlayersInfoResponseInterface> {
    return this.matchService.getMatchInfo(accessToken);
  }
}
