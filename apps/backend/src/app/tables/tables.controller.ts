import { Body, Controller, Get, Query } from '@nestjs/common';
import { TablesService } from './tables.service';
import { GetTop10Dto, LeaderTableInterface } from '@dfcomps/contracts';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('top10')
  top10Table(@Query() { physics, mode }: GetTop10Dto): Promise<LeaderTableInterface[]> {
    return this.tablesService.getTop10(physics, mode);
  }
}
