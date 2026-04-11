import { Controller, Post, Get, Headers, UseInterceptors, UploadedFile, ParseFilePipe, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UploadDemoResponseInterface,
  WrLastFiveItemInterface,
  WrListResponseInterface,
  WrPlayerSearchItemInterface,
} from '@dfcomps/contracts';
import { WorldRecordsService } from './world-records.service';
import { UploadWrDemoDto } from './dto/upload-wr-demo.dto';
import { MulterFileInterface } from '../../shared/interfaces/multer.interface';

@Controller('world-records')
export class WorldRecordsController {
  constructor(private readonly worldRecordsService: WorldRecordsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('demo'))
  uploadWrDemo(
    @Headers('X-Auth') accessToken: string | undefined,
    @UploadedFile(new ParseFilePipe())
    demo: MulterFileInterface,
    @Body() { playerType, userId }: UploadWrDemoDto,
  ): Promise<UploadDemoResponseInterface> {
    return this.worldRecordsService.uploadWrDemo(accessToken, demo, playerType, userId);
  }

  @Get('list')
  getWrList(
    @Query('page') page = '1',
    @Query('filter') filter = '',
    @Query('physics') physics = '',
  ): Promise<WrListResponseInterface> {
    return this.worldRecordsService.getWrList(parseInt(page) || 1, filter, physics);
  }

  @Get('last-five')
  getLastFive(): Promise<WrLastFiveItemInterface[]> {
    return this.worldRecordsService.getLastFive();
  }

  @Get('search-players')
  searchPlayers(
    @Headers('X-Auth') accessToken: string | undefined,
    @Query('nick') nick = '',
  ): Promise<WrPlayerSearchItemInterface[]> {
    return this.worldRecordsService.searchPlayers(accessToken, nick);
  }
}
