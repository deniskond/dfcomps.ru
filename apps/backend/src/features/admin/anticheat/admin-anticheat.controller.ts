import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  AnticheatDemoCheckInterface,
  AnticheatDemoSourceInterface,
  AnticheatDemoSourcesDto,
  AnticheatPlayerScoresInterface,
} from '@dfcomps/contracts';
import { AdminAnticheatService, CheckerResponse } from './admin-anticheat.service';

@Controller('admin/anticheat')
export class AdminAnticheatController {
  constructor(private readonly adminAnticheatService: AdminAnticheatService) {}

  @Get('status')
  async getStatus(@Headers('X-Auth') accessToken: string | undefined, @Res() response: Response): Promise<void> {
    this.forward(response, await this.adminAnticheatService.getStatus(accessToken));
  }

  @Get('checked-demos')
  async getCheckedDemos(@Headers('X-Auth') accessToken: string | undefined, @Res() response: Response): Promise<void> {
    this.forward(response, await this.adminAnticheatService.getCheckedDemos(accessToken));
  }

  @Post('demo-sources')
  getDemoSources(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { demoIds }: AnticheatDemoSourcesDto,
  ): Promise<AnticheatDemoSourceInterface[]> {
    return this.adminAnticheatService.getDemoSources(accessToken, demoIds);
  }

  @Get('player-scores')
  async getPlayerScores(@Headers('X-Auth') accessToken: string | undefined, @Res() response: Response): Promise<void> {
    this.forward(response, await this.adminAnticheatService.getPlayerScores(accessToken));
  }

  @Put('player-scores')
  async putPlayerScores(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() body: unknown,
    @Res() response: Response,
  ): Promise<void> {
    this.forward(response, await this.adminAnticheatService.putPlayerScores(accessToken, body));
  }

  @Post('validation/check-demo/:demoId')
  checkDemo(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('demoId', new ParseIntPipe()) demoId: number,
  ): Promise<AnticheatDemoCheckInterface> {
    return this.adminAnticheatService.checkDemo(accessToken, demoId);
  }

  @Get('validation/:cupId/player-scores')
  getCupPlayerScores(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<AnticheatPlayerScoresInterface> {
    return this.adminAnticheatService.getCupPlayerScores(accessToken, cupId);
  }

  // The scorer reads the checker's status and error body, so they stay as they are
  private forward(response: Response, { status, body }: CheckerResponse): void {
    response.status(status).send(body);
  }
}
