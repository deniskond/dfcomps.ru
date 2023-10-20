import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AdminCupsService } from './admin-cups.service';
import { AdminCupDto } from '@dfcomps/contracts';

@Controller('admin/cups')
export class AdminCupsController {
  constructor(private readonly adminCupsService: AdminCupsService) {}

  @Get('get-all-cups')
  getAllCups(@Headers('X-Auth') accessToken: string | undefined): Promise<any> {
    return this.adminCupsService.getAllCups(accessToken);
  }

  @Get('get/:cupId')
  getSingleCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<any> {
    return this.adminCupsService.getSingleCup(accessToken, cupId);
  }

  @Post('delete/:cupId')
  deleteCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.deleteCup(accessToken, cupId);
  }

  @Post('post')
  addCup(@Headers('X-Auth') accessToken: string | undefined, @Body() cupDto: AdminCupDto): Promise<void> {
    return this.adminCupsService.addCup(accessToken, cupDto);
  }

  @Post('update/:cupId')
  updateCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() cupDto: AdminCupDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.updateCup(accessToken, cupDto, cupId);
  }
}
