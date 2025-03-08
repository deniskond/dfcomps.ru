import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CupService } from './cup.service';
import {
  CheckCupRegistrationInterface,
  CupInterface,
  ArchiveLinkInterface,
  OnlineCupInfoInterface,
  CheckPreviousCupsType,
  WorldspawnMapInfoInterface,
  MapRatingInterface,
} from '@dfcomps/contracts';
import { CupRegistrationDto } from './dto/cup-registration.dto';
import { MapSuggestionDto } from './dto/map-suggestion.dto';
import { MapReviewDto } from './dto/map-review.dto';

@Controller('cup')
export class CupController {
  constructor(private readonly cupService: CupService) {}

  @Get('next-cup-info')
  nextCupInfo(@Headers('X-Auth') accessToken: string | undefined): Promise<CupInterface> {
    return this.cupService.getNextCupInfo(accessToken);
  }

  @Post('is-registered')
  checkIfPlayerRegistered(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CupRegistrationDto,
  ): Promise<CheckCupRegistrationInterface> {
    return this.cupService.checkIfPlayerRegistered(accessToken, cupId);
  }

  @Get('validation-archive-link/:cupId')
  getValidationArchiveLink(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<ArchiveLinkInterface> {
    return this.cupService.getValidationArchiveLink(accessToken, cupId);
  }

  @Get('streamers-archive-link/:cupId')
  getStreamersArchiveLink(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('cupId', new ParseIntPipe()) cupId: number,
  ): Promise<ArchiveLinkInterface> {
    return this.cupService.getStreamersArchiveLink(accessToken, cupId);
  }

  @Post('online/register')
  registerForOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CupRegistrationDto,
  ): Promise<void> {
    return this.cupService.registerForOnlineCup(accessToken, cupId);
  }

  @Post('online/cancel-registration')
  cancelRegistrationForOnlineCup(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId }: CupRegistrationDto,
  ): Promise<void> {
    return this.cupService.cancelRegistrationForOnlineCup(accessToken, cupId);
  }

  @Post('suggest')
  suggestMap(@Headers('X-Auth') accessToken: string | undefined, @Body() { mapName }: MapSuggestionDto): Promise<void> {
    return this.cupService.suggestMap(accessToken, mapName);
  }

  @Get('online-cup/:uuid')
  getOnlineCupInfo(@Param('uuid') uuid: string): Promise<OnlineCupInfoInterface> {
    return this.cupService.getOnlineCupInfo(uuid);
  }

  @Get('check-previous-cups/:mapName')
  checkPreviousCups(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('mapName') mapName: string,
  ): Promise<CheckPreviousCupsType> {
    return this.cupService.checkPreviousCups(accessToken, mapName);
  }

  @Get('get-worldspawn-map-info')
  getWorldspawnMapInfo(
    @Headers('X-Auth') accessToken: string | undefined,
    @Query() { map }: Record<string, string>,
  ): Promise<WorldspawnMapInfoInterface> {
    return this.cupService.getWorldspawnMapInfo(accessToken, map);
  }

  @Post('review')
  reviewMap(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { cupId, vote }: MapReviewDto,
  ): Promise<MapRatingInterface> {
    return this.cupService.reviewMap(accessToken, cupId, vote);
  }
}
