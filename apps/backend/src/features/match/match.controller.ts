import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { DuelPlayersInfoResponseInterface, MatchSecretDto, MatchStartDto } from '@dfcomps/contracts';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  getMatchInfo(@Headers('X-Auth') accessToken: string): Promise<DuelPlayersInfoResponseInterface> {
    return this.matchService.getMatchInfo(accessToken);
  }

  @Get('get-eligible-players')
  getEligiblePlayers(): Promise<number[]> {
    return this.matchService.getEligiblePlayers();
  }

  @Post('start')
  startMatch(
    @Headers('secretKey') secretKey: string | undefined,
    @Body() { firstPlayerId, secondPlayerId, physics }: MatchStartDto,
  ): Promise<void> {
    return this.matchService.startMatch(secretKey, firstPlayerId, secondPlayerId, physics);
  }
}
