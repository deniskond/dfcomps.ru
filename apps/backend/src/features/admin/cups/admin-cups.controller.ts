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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminCupsService } from './admin-cups.service';
import {
  AddOfflineCupDto,
  AdminActiveCupInterface,
  AdminActiveMulticupInterface,
  AdminCupInterface,
  AdminEditCupInterface,
  AdminValidationInterface,
  CupTypes,
  NewsTypes,
  OnlineCupActionDto,
  OnlineCupPlayersInterface,
  OnlineCupRoundResultsInterface,
  OnlineCupServersPlayersInterface,
  ParsedOnlineCupRoundInterface,
  ProcessValidationDto,
  SaveOnlineCupRoundDto,
  SetOnlineCupMapsDto,
  SetPlayerServerDto,
  UpdateOfflineCupDto,
  UploadedFileLinkInterface,
  WarcupStateInterface,
  WarcupSuggestionStatsInterface,
  WarcupVoteDto,
  WarcupVotingInterface,
} from '@dfcomps/contracts';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileInterface } from 'apps/backend/src/shared/interfaces/multer.interface';
import { EnumValidationPipe } from 'apps/backend/src/shared/validation/enum-validation.pipe';
import { AdminWarcupsService } from './admin-warcups.service';
import { MapSuggestionDto } from '../../cup/dto/map-suggestion.dto';

@Controller('admin/cups')
export class AdminCupsController {
  constructor(
    private readonly adminCupsService: AdminCupsService,
    private readonly adminWarcupsService: AdminWarcupsService,
  ) {}

  @Get('get-all-cups')
  getAllCups(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminCupInterface[]> {
    return this.adminCupsService.getAllCups(accessToken);
  }

  @Get('get/:cupId')
  getSingleCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<AdminEditCupInterface> {
    return this.adminCupsService.getSingleCup(accessToken, cupId);
  }

  @Post('delete/:cupId')
  deleteCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.deleteCup(accessToken, cupId);
  }

  @Post('add-offline-cup')
  addOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() addOfflineCupDto: AddOfflineCupDto,
  ): Promise<void> {
    return this.adminCupsService.addOfflineCup(accessToken, addOfflineCupDto);
  }

  @Post('update-offline-cup/:cupId')
  updateOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() updateOfflineCupDto: UpdateOfflineCupDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.updateOfflineCup(accessToken, updateOfflineCupDto, cupId);
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
  calculateOfflineCupRating(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.calculateOfflineCupRating(accessToken, cupId);
  }

  @Post('finish-offline-cup/:cupId')
  finishOfflineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.finishOfflineCup(accessToken, cupId);
  }

  @Post('add-online-cup')
  addOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() addOnlineCupDto: OnlineCupActionDto,
  ): Promise<void> {
    return this.adminCupsService.addOnlineCup(accessToken, addOnlineCupDto);
  }

  @Post('update-online-cup/:cupId')
  updateOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() updateOnlineCupDto: OnlineCupActionDto,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.updateOnlineCup(accessToken, updateOnlineCupDto, cupId);
  }

  @Post('upload-map/:mapName')
  @UseInterceptors(FileInterceptor('file'))
  uploadMap(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('mapName') mapName: string,
    @UploadedFile(new ParseFilePipe()) map: MulterFileInterface,
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
    levelshot: MulterFileInterface,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminCupsService.uploadLevelshot(accessToken, levelshot, mapName);
  }

  @Get('get-all-cups-without-news/:cupType/:newsType')
  getAllOfflineCupsWithoutNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupType', new EnumValidationPipe(CupTypes)) cupType: CupTypes,
    @Param('newsType', new EnumValidationPipe(NewsTypes)) newsType: NewsTypes,
  ): Promise<AdminActiveCupInterface[]> {
    return this.adminCupsService.getAllCupsWithoutNews(accessToken, cupType, newsType);
  }

  @Get('get-all-active-multicups')
  getAllActiveMulticups(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminActiveMulticupInterface[]> {
    return this.adminCupsService.getAllActiveMulticups(accessToken);
  }

  @Get('online/get-servers-players/:cupId')
  getOnlineCupServersPlayers(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<OnlineCupServersPlayersInterface> {
    return this.adminCupsService.getOnlineCupServersPlayers(accessToken, cupId);
  }

  @Post('online/set-player-server')
  setPlayerServer(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { userId, onlineCupId, serverNumber }: SetPlayerServerDto,
  ): Promise<void> {
    return this.adminCupsService.setPlayerServer(accessToken, userId, onlineCupId, serverNumber);
  }

  @Post('online/parse-server-logs/:cupId')
  @UseInterceptors(FileInterceptor('serverLogs'))
  parseServerLogs(
    @Headers('X-Auth') accessToken: string | undefined,
    @UploadedFile(new ParseFilePipe())
    serverLogs: MulterFileInterface,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<ParsedOnlineCupRoundInterface> {
    return this.adminCupsService.parseServerLogs(accessToken, serverLogs, cupId);
  }

  @Post('online/save-round-results')
  saveRoundResults(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId, roundNumber, roundResults }: SaveOnlineCupRoundDto,
  ): Promise<void> {
    return this.adminCupsService.saveRoundResults(accessToken, cupId, roundNumber, roundResults);
  }

  @Post('online/set-maps')
  setOnlineCupMaps(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId, maps }: SetOnlineCupMapsDto,
  ): Promise<void> {
    return this.adminCupsService.setOnlineCupMaps(accessToken, cupId, maps);
  }

  @Get('online/players/:cupId')
  getOnlineCupPlayers(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<OnlineCupPlayersInterface> {
    return this.adminCupsService.getOnlineCupPlayers(accessToken, cupId);
  }

  @Post('online/finish/:cupId')
  finishOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<void> {
    return this.adminCupsService.finishOnlineCup(accessToken, cupId);
  }

  @Get('online/round-results/:cupId/:roundNumber')
  getOnlineCupRoundResults(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
    @Param('roundNumber', new ParseIntPipe()) roundNumber: number,
  ): Promise<OnlineCupRoundResultsInterface> {
    return this.adminCupsService.getOnlineCupRoundResults(accessToken, cupId, roundNumber);
  }

  @Get('warcup-state')
  getWarcupState(@Headers('X-Auth') accessToken: string | undefined): Promise<WarcupStateInterface> {
    return this.adminWarcupsService.getWarcupState(accessToken);
  }

  @Get('warcup-suggestion-stats')
  getWarcupSuggestioStats(@Headers('X-Auth') accessToken: string | undefined): Promise<WarcupSuggestionStatsInterface> {
    return this.adminWarcupsService.getWarcupSuggestionStats(accessToken);
  }

  @Get('warcup-voting')
  getWarcupVotingInfo(@Headers('X-Auth') accessToken: string | undefined): Promise<WarcupVotingInterface> {
    return this.adminWarcupsService.getWarcupVotingInfo(accessToken);
  }

  @Post('warcup-vote')
  warcupVote(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { mapSuggestionId }: WarcupVoteDto,
  ): Promise<void> {
    return this.adminWarcupsService.warcupVote(accessToken, mapSuggestionId);
  }

  @Post('warcup-suggest')
  warcupAdminSuggest(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { mapName }: MapSuggestionDto,
  ): Promise<void> {
    return this.adminWarcupsService.warcupAdminSuggest(accessToken, mapName);
  }
}
