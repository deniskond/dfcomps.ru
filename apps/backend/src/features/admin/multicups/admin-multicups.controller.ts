import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AdminActiveMulticupInterface, AdminMulticupActionInterface, MulticupActionDto } from '@dfcomps/contracts';
import { AdminMulticupsService } from './admin-multicups.service';

@Controller('admin/multicups')
export class AdminMulticupsController {
  constructor(private readonly adminMulticupsService: AdminMulticupsService) {}

  @Get('get-all-multicups')
  getAllMulticups(@Headers('X-Auth') accessToken: string | undefined): Promise<any> {
    return this.adminMulticupsService.getAllMulticups(accessToken);
  }

  @Get('get/:multicupId')
  getSingleMulticup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<AdminMulticupActionInterface> {
    return this.adminMulticupsService.getSingleMulticup(accessToken, multicupId);
  }

  @Post('delete/:multicupId')
  deleteMulticup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<void> {
    return this.adminMulticupsService.deleteMulticup(accessToken, multicupId);
  }

  @Post('calculate-ee-ratings/:multicupId')
  calculateMulticupEERatings(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<void> {
    return this.adminMulticupsService.calculateMulticupEERatings(accessToken, multicupId);
  }

  @Post('finish/:multicupId')
  finishMulticup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('multicupId', new ParseIntPipe()) multicupId: number,
  ): Promise<void> {
    return this.adminMulticupsService.finishMulticup(accessToken, multicupId);
  }

  @Post('add-multicup')
  addMulticup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() multicupActionDto: MulticupActionDto,
  ): Promise<void> {
    return this.adminMulticupsService.addMulticup(accessToken, multicupActionDto);
  }

  @Post('update-multicup/:multicupId')
  updateMulticup(
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
