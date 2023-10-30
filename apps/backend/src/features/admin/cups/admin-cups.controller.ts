import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminCupsService } from './admin-cups.service';
import {
  AddCupDto,
  AdminActiveMulticupInterface,
  AdminEditOfflineCupInterface,
  AdminValidationInterface,
  ProcessValidationDto,
  UploadedFileLinkInterface,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';
import { FileInterceptor } from '@nestjs/platform-express';

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
  ): Promise<AdminEditOfflineCupInterface> {
    return this.adminCupsService.getSingleCup(accessToken, cupId);
  }

  @Post('delete/:cupId')
  deleteCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.deleteCup(accessToken, cupId);
  }

  @Post('add')
  addCup(@Headers('X-Auth') accessToken: string | undefined, @Body() cupDto: AddCupDto): Promise<void> {
    return this.adminCupsService.addCup(accessToken, cupDto);
  }

  @Post('update/:cupId')
  updateCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() cupDto: AddCupDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.updateCup(accessToken, cupDto, cupId);
  }

  @Get('get-validation-demos/:cupId')
  getValidationDemos(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<AdminValidationInterface> {
    return this.adminCupsService.getValidationDemos(accessToken, cupId);
  }

  @Post('process-validation/:cupId')
  processValidate(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() processValidationDto: ProcessValidationDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.processValidation(accessToken, processValidationDto, cupId);
  }

  @Post('calculate-rating/:cupId')
  calculateRating(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.calculateRating(accessToken, cupId);
  }

  @Post('finish-offline-cup/:cupId')
  finishOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.finishOfflineCup(accessToken, cupId);
  }

  @Get('get-all-active-multicups')
  getAllActiveMulticups(): Promise<AdminActiveMulticupInterface[]> {
    return this.adminCupsService.getAllActiveMulticups();
  }

  @Get('get-worldspawn-map-info')
  getWorldspawnMapInfo(
    @Headers('X-Auth') accessToken: string | undefined,
    @Query() { map }: Record<string, string>,
  ): Promise<WorldspawnMapInfoInterface> {
    return this.adminCupsService.getWorldspawnMapInfo(accessToken, map);
  }

  @Post('upload-map/:mapName')
  @UseInterceptors(FileInterceptor('file'))
  uploadMap(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('mapName') mapName: string,
    @UploadedFile(new ParseFilePipe()) map: Express.Multer.File,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminCupsService.uploadMap(accessToken, map, mapName);
  }

  @Post('upload-levelshot/:mapName')
  @UseInterceptors(FileInterceptor('file'))
  uploadLevelshot(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('mapName') mapName: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpg|jpeg/,
        })
        .addMaxSizeValidator({
          maxSize: 5000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    levelshot: Express.Multer.File,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminCupsService.uploadLevelshot(accessToken, levelshot, mapName);
  }
}
