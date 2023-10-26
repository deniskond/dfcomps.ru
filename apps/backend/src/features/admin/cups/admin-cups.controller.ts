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
} from '@nestjs/common';
import { AdminCupsService } from './admin-cups.service';
import {
  AddCupDto,
  AdminActiveMulticupInterface,
  AdminValidationInterface,
  ProcessValidationDto,
  UploadedFileLinkInterface,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';

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

  @Post('upload-map')
  uploadMap(
    @Headers('X-Auth') accessToken: string | undefined,
    @UploadedFile(new ParseFilePipe()) map: Express.Multer.File,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminCupsService.uploadMap(accessToken, map);
  }

  @Post('upload-levelshot')
  uploadLevelshot(
    @Headers('X-Auth') accessToken: string | undefined,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpg|png|gif|jpeg/,
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
    return this.adminCupsService.uploadLevelshot(accessToken, levelshot);
  }
}
