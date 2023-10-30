import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { DuelPlayersInfoResponseInterface, EligiblePlayersInterface, MatchStartDto, UpdateBotTimeDto, UpdateMatchInfoDto } from '@dfcomps/contracts';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('info')
  getMatchInfo(@Headers('X-Auth') accessToken: string): Promise<DuelPlayersInfoResponseInterface> {
    return this.matchService.getMatchInfo(accessToken);
  }

  @Get('get-eligible-players')
  getEligiblePlayers(): Promise<EligiblePlayersInterface> {
    return this.matchService.getEligiblePlayers();
  }

  @Post('start')
  startMatch(
    @Headers('secretKey') secretKey: string | undefined,
    @Body() { firstPlayerId, secondPlayerId, physics }: MatchStartDto,
  ): Promise<void> {
    return this.matchService.startMatch(secretKey, firstPlayerId, secondPlayerId, physics);
  }

  @Post('update-match-info')
  updateMatchInfo(
    @Headers('secretKey') secretKey: string | undefined,
    @Body() { firstPlayerId, secondPlayerId, map }: UpdateMatchInfoDto,
  ): Promise<void> {
    return this.matchService.updateMatchInfo(secretKey, firstPlayerId, secondPlayerId, map);
  }

  @Post('update-bot-time')
  updateBotTime(
    @Headers('secretKey') secretKey: string | undefined,
    @Body() updateBotTimeDto: UpdateBotTimeDto,
  ): Promise<void> {
    return this.matchService.updateBotTime(secretKey, updateBotTimeDto);
  }
}
