import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TablesService } from './tables.service';
import { GetTop10Dto, LeaderTableInterface, Physics, PlayersCountInterface } from '@dfcomps/contracts';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('top10')
  top10Table(@Query() { physics, mode }: GetTop10Dto): Promise<LeaderTableInterface[]> {
    return this.tablesService.getTop10(physics, mode);
  }

  @Get('rating/:physics/:page')
  getPhysicsRatingByPage(
    @Param('physics') physics: Physics,
    @Param('page', new ParseIntPipe()) page: number,
  ): Promise<LeaderTableInterface[]> {
    if (physics !== Physics.CPM && physics !== Physics.VQ3) {
      throw new BadRequestException('Wrong physics name');
    }

    return this.tablesService.getPhysicsRatingByPage(physics, page);
  }

  @Get('rating_table_players_count')
  getRatingTablePlayersCount(): Promise<PlayersCountInterface> {
    return this.tablesService.getRatingTablePlayersCount();
  }
}
