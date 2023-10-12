import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TablesService } from './tables.service';
import { LeaderTableInterface, Physics, PaginationCountInterface } from '@dfcomps/contracts';
import { GetTop10Dto } from './dto/get-top10.dto';

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
  getRatingTablePlayersCount(): Promise<PaginationCountInterface> {
    return this.tablesService.getRatingTablePlayersCount();
  }

  @Get('season_rating/:physics/:page/:season')
  getSeasonPhysicsRatingByPage(
    @Param('physics') physics: Physics,
    @Param('page', new ParseIntPipe()) page: number,
    @Param('season', new ParseIntPipe()) season: number,
  ): Promise<LeaderTableInterface[]> {
    if (physics !== Physics.CPM && physics !== Physics.VQ3) {
      throw new BadRequestException('Wrong physics name');
    }

    return this.tablesService.getSeasonPhysicsRatingByPage(physics, page, season);
  }

  @Get('season_rating_table_players_count/:season')
  getSeasonRatingPlayersCount(@Param('season', new ParseIntPipe()) season: number): Promise<PaginationCountInterface> {
    return this.tablesService.getSeasonRatingTablePlayersCount(season);
  }
}
