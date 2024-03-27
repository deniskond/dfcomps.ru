import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AdminActiveMulticupInterface, AdminEditMulticupInterface, MulticupActionDto } from '@dfcomps/contracts';
import { AdminMulticupsService } from './admin-multicups.service';

@Controller('admin/multicups')
export class AdminMulticupsController {
  constructor(private readonly adminMulticupsService: AdminMulticupsService) {}

  @Get('get-all-multicups')
  getAllCups(@Headers('X-Auth') accessToken: string | undefined): Promise<any> {
    return this.adminMulticupsService.getAllMulticups(accessToken);
  }

  @Get('get/:multicupId')
  getSingleCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<AdminEditMulticupInterface> {
    return this.adminMulticupsService.getSingleMulticup(accessToken, multicupId);
  }

  @Post('delete/:multicupId')
  deleteCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<void> {
    return this.adminMulticupsService.deleteMulticup(accessToken, multicupId);
  }

  @Post('add-multicup')
  addOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() multicupActionDto: MulticupActionDto,
  ): Promise<void> {
    return this.adminMulticupsService.addMulticup(accessToken, multicupActionDto);
  }

  @Post('update-multicup/:multicupId')
  updateOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() updateMulticupDto: MulticupActionDto,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<void> {
    return this.adminMulticupsService.updateMulticup(accessToken, updateMulticupDto, multicupId);
  }

  @Get('get-all-active-multicups')
  getAllActiveMulticups(): Promise<AdminActiveMulticupInterface[]> {
    return this.adminMulticupsService.getAllActiveMulticups();
  }
}
