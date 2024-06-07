import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import {
  AdminEditNewsInterface,
  AdminNewsListInterface,
  NewsTypes,
  AdminNewsDto,
  AdminCupInterface,
  AdminValidationInterface,
  ValidationResultInterface,
  VerifiedStatuses,
  AdminActiveMulticupInterface,
  UploadedFileLinkInterface,
  AdminEditCupInterface,
  AddOfflineCupDto,
  ProcessValidationDto,
  AdminActiveCupInterface,
  UpdateOfflineCupDto,
  OnlineCupActionDto,
  AdminMulticupInterface,
  AdminMulticupActionInterface,
  MulticupActionDto,
  CupTypes,
  SetOnlineCupMapsDto,
  OnlineCupPlayersInterface,
  ParsedOnlineCupRoundInterface,
  SaveOnlineCupRoundDto,
  RoundResultEntryInterface,
  OnlineCupServersPlayersInterface,
  SetPlayerServerDto,
  OnlineCupRoundResultsInterface,
} from '@dfcomps/contracts';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  private news: AdminNewsListInterface[];
  private cups: AdminCupInterface[];
  private multicups: AdminMulticupInterface[];

  constructor(private backendService: BackendService) {}

  public getAllNews$(cache = true): Observable<AdminNewsListInterface[]> {
    if (this.news && cache) {
      return of(this.news);
    }

    return this.backendService
      .get$<AdminNewsListInterface[]>(URL_PARAMS.ADMIN.GET_NEWS)
      .pipe(tap((news: AdminNewsListInterface[]) => (this.news = news)));
  }

  public deleteNewsItem$(newsId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.DELETE_NEWS(newsId));
  }

  public getAllCups$(cache = true): Observable<AdminCupInterface[]> {
    if (this.cups && cache) {
      return of(this.cups);
    }

    return this.backendService
      .get$<AdminCupInterface[]>(URL_PARAMS.ADMIN.GET_CUPS)
      .pipe(tap((cups: AdminCupInterface[]) => (this.cups = cups)));
  }

  public getSingleCup$(cupId: number): Observable<AdminEditCupInterface> {
    return this.backendService.get$<AdminEditCupInterface>(URL_PARAMS.ADMIN.GET_SINGLE_CUP(cupId));
  }

  public getCupValidationInfo$(newsId: number): Observable<AdminValidationInterface> {
    return this.backendService.get$<AdminValidationInterface>(URL_PARAMS.ADMIN.CUP_VALIDATION(newsId));
  }

  public setCups(cups: AdminCupInterface[]): void {
    this.cups = cups;
  }

  public setNews(news: AdminNewsListInterface[]): void {
    this.news = news;
  }

  public saveSeasonRatings$(): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.SAVE_SEASON_RATINGS);
  }

  public setSeasonRewards$(): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.SET_SEASON_REWARDS);
  }

  public resetSeasonRatings$(): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.RESET_SEASON_RATINGS);
  }

  public incrementSeason$(): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.INCREMENT_SEASON);
  }

  public sendValidationResult$(formValue: Record<string, boolean | string | null>, cupId: number): Observable<void> {
    const demosIds: number[] = Object.keys(formValue).reduce((acc: number[], controlKey) => {
      if (controlKey.match(/demo/)) {
        acc.push(parseInt(controlKey.split('_')[1]));
      }

      return acc;
    }, []);

    const validationResults: ValidationResultInterface[] = demosIds.map((demoId: number) => ({
      id: demoId,
      validationStatus: this.getDemoValidationResult(formValue['demo_' + demoId] as boolean | null),
      reason: formValue['reason_' + demoId]?.toString() || null,
      isOrganizer: !!formValue['org_' + demoId],
      isOutsideCompetition: !!formValue['exclude_' + demoId],
    }));

    const processValidationDto: ProcessValidationDto = {
      validationResults: JSON.stringify(validationResults) as any, // HTTP issue with sending objects
      allDemosCount: demosIds.length,
    };

    return this.backendService.post$<void>(URL_PARAMS.ADMIN.PROCESS_VALIDATION(cupId), processValidationDto);
  }

  public postNews$(formValue: Record<string, any>, newsType: NewsTypes): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.POST_NEWS, this.getAdminNewsDto(formValue, newsType));
  }

  public getSingleNews$(newsId: string): Observable<AdminEditNewsInterface> {
    return this.backendService.get$<AdminEditNewsInterface>(URL_PARAMS.ADMIN.GET_SINGLE_NEWS(newsId));
  }

  public editNews$(formValue: Record<string, any>, newsId: string, newsType: NewsTypes): Observable<void> {
    return this.backendService.post$<void>(
      URL_PARAMS.ADMIN.UPDATE_NEWS(newsId),
      this.getAdminNewsDto(formValue, newsType),
    );
  }

  public getAllAvailableMulticups$(): Observable<AdminActiveMulticupInterface[]> {
    return this.backendService.get$<AdminActiveMulticupInterface[]>(URL_PARAMS.ADMIN.GET_ALL_AVAILABLE_MULTICUPS);
  }

  public getAllCupsWithoutNews$(cupType: CupTypes, newsType: NewsTypes): Observable<AdminActiveCupInterface[]> {
    return this.backendService.get$<AdminActiveCupInterface[]>(
      URL_PARAMS.ADMIN.GET_ALL_CUPS_WITHOUT_NEWS(cupType, newsType),
    );
  }

  public addOfflineCup$(formValue: Record<string, any>): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.ADD_OFFLINE_CUP, {
      fullName: formValue['fullName'],
      shortName: formValue['shortName'],
      startTime: formValue['startTime'],
      endTime: formValue['endTime'],
      multicupId: formValue['multicup'],
      mapName: formValue['mapName'],
      mapAuthor: formValue['mapAuthor'],
      weapons: this.getWeaponsFromForm(formValue),
      addNews: formValue['addNews'],
      size: formValue['size'],
      mapLevelshotLink: formValue['mapLevelshotLink'],
      mapPk3Link: formValue['mapPk3Link'],
    } as AddOfflineCupDto);
  }

  public editOfflineCup$(formValue: Record<string, any>, cupId: number): Observable<void> {
    const updateCupDto: UpdateOfflineCupDto = {
      fullName: formValue['fullName'],
      shortName: formValue['shortName'],
      startTime: formValue['startTime'],
      endTime: formValue['endTime'],
      mapName: formValue['mapName'],
      mapAuthor: formValue['mapAuthor'],
      weapons: this.getWeaponsFromForm(formValue),
      addNews: formValue['addNews'],
      size: formValue['size'],
      mapLevelshotLink: formValue['mapLevelshotLink'] || undefined,
      mapPk3Link: formValue['mapPk3Link'] || undefined,
    };

    if (formValue['multicup']) {
      updateCupDto.multicupId = formValue['multicup'];
    }

    return this.backendService.post$<void>(URL_PARAMS.ADMIN.UPDATE_OFFLINE_CUP(cupId), updateCupDto);
  }

  public addOnlineCup$(formValue: Record<string, any>): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.ADD_ONLINE_CUP, {
      fullName: formValue['fullName'],
      shortName: formValue['shortName'],
      startTime: formValue['startTime'],
      useTwoServers: formValue['useTwoServers'],
      server1: formValue['server1'],
      server2: formValue['server2'],
      physics: formValue['physics'],
    } as OnlineCupActionDto);
  }

  public editOnlineCup$(formValue: Record<string, any>, cupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.UPDATE_ONLINE_CUP(cupId), {
      fullName: formValue['fullName'],
      shortName: formValue['shortName'],
      startTime: formValue['startTime'],
      addNews: formValue['addNews'],
      useTwoServers: formValue['useTwoServers'],
      server1: formValue['server1'],
      server2: formValue['server2'],
      physics: formValue['physics'],
    } as OnlineCupActionDto);
  }

  public deleteCup$(cupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.DELETE_CUP(cupId));
  }

  public calculateCupRating$(cupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.CALCULATE_CUP_RATING(cupId));
  }

  public finishOfflineCup$(cupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.FINISH_OFFLINE_CUP(cupId));
  }

  public finishOnlineCup$(cupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.FINISH_ONLINE_CUP(cupId));
  }

  public addCustomMap$(map: File, mapName: string): Observable<UploadedFileLinkInterface> {
    return this.backendService.uploadFile$(URL_PARAMS.ADMIN.UPLOAD_MAP(mapName), [{ fileKey: 'file', file: map }]);
  }

  public addCustomLevelshot$(levelshot: File, mapName: string): Observable<UploadedFileLinkInterface> {
    return this.backendService.uploadFile$(URL_PARAMS.ADMIN.UPLOAD_LEVELSHOT(mapName), [
      { fileKey: 'file', file: levelshot },
    ]);
  }

  public getAllMulticups$(cache = true): Observable<AdminMulticupInterface[]> {
    if (this.multicups && cache) {
      return of(this.multicups);
    }

    return this.backendService
      .get$<AdminMulticupInterface[]>(URL_PARAMS.ADMIN.GET_MULTICUPS)
      .pipe(tap((multicups: AdminMulticupInterface[]) => (this.multicups = multicups)));
  }

  public getSingleMulticup$(multicupId: number): Observable<AdminMulticupActionInterface> {
    return this.backendService.get$<AdminMulticupActionInterface>(URL_PARAMS.ADMIN.GET_SINGLE_MULTICUP(multicupId));
  }

  public addMulticup$(name: string, rounds: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.ADD_MULTICUP, {
      name,
      rounds,
    } as MulticupActionDto);
  }

  public editMulticup$(name: string, rounds: number, multicupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.UPDATE_MULTICUP(multicupId), {
      name,
      rounds,
    } as MulticupActionDto);
  }

  public deleteMulticup$(multicupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.DELETE_MULTICUP(multicupId));
  }

  public setMulticups(multicups: AdminMulticupInterface[]): void {
    this.multicups = multicups;
  }

  public setOnlineCupMaps$(cupId: number, maps: (string | null)[]): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.SET_ONLINE_CUP_MAPS, {
      cupId,
      maps,
    } as SetOnlineCupMapsDto);
  }

  public getOnlineCupPlayers$(cupId: number): Observable<OnlineCupPlayersInterface> {
    return this.backendService.get$<OnlineCupPlayersInterface>(URL_PARAMS.ADMIN.ONLINE_CUP_PLAYERS(cupId));
  }

  public uploadServerLogs$(cupId: number, serverLogs: File): Observable<ParsedOnlineCupRoundInterface> {
    return this.backendService.uploadFile$(URL_PARAMS.ADMIN.PARSE_SERVER_LOGS(cupId), [
      { fileKey: 'serverLogs', file: serverLogs },
    ]);
  }

  public saveOnlineCupRoundResults$(
    cupId: number,
    roundNumber: number,
    roundResults: RoundResultEntryInterface[],
  ): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.ONLINE_CUP_SAVE_ROUND_RESULTS, {
      cupId,
      roundNumber,
      roundResults: JSON.stringify(roundResults) as any,
    } as SaveOnlineCupRoundDto);
  }

  public getOnlineCupServersPlayers$(cupId: number): Observable<OnlineCupServersPlayersInterface> {
    return this.backendService.get$<OnlineCupServersPlayersInterface>(
      URL_PARAMS.ADMIN.ONLINE_CUP_SERVERS_PLAYERS(cupId),
    );
  }

  public setPlayerServer$(userId: number, serverNumber: number, onlineCupId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.SET_PLAYER_SERVER, {
      userId,
      serverNumber,
      onlineCupId,
    } as SetPlayerServerDto);
  }

  public getOnlineCupRoundResults$(cupId: number, roundNumber: number): Observable<OnlineCupRoundResultsInterface> {
    return this.backendService.get$<OnlineCupRoundResultsInterface>(
      URL_PARAMS.ADMIN.GET_ONLINE_CUP_ROUND_RESULTS(cupId, roundNumber),
    );
  }

  private getAdminNewsDto(formValue: Record<string, any>, newsType: NewsTypes): AdminNewsDto {
    const adminNewsDto: AdminNewsDto = {
      russianTitle: formValue['russianTitle'],
      englishTitle: formValue['englishTitle'],
      postingTime: formValue['timeOption'] === 'now' ? moment().format() : formValue['postingTime'],
      russianText: formValue['russianText'],
      englishText: formValue['englishText'],
      type: newsType,
    };

    if (formValue['youtube']) {
      adminNewsDto.youtube = formValue['youtube'];
    }

    if (formValue['cup']) {
      adminNewsDto.cupId = formValue['cup'];
    }

    if (formValue['multicup']) {
      adminNewsDto.multicupId = formValue['multicup'];
    }

    return adminNewsDto;
  }

  private getDemoValidationResult(value: boolean | null): VerifiedStatuses {
    if (value === null) {
      return VerifiedStatuses.UNWATCHED;
    }

    if (value === true) {
      return VerifiedStatuses.VALID;
    }

    return VerifiedStatuses.INVALID;
  }

  private getWeaponsFromForm(formValue: Record<string, any>): string {
    let result = '';

    if (formValue['gauntlet']) result += 'U';
    if (formValue['rocket']) result += 'R';
    if (formValue['shotgun']) result += 'S';
    if (formValue['railgun']) result += 'I';
    if (formValue['lightning']) result += 'L';
    if (formValue['grenade']) result += 'G';
    if (formValue['plasma']) result += 'P';
    if (formValue['bfg']) result += 'B';
    if (formValue['grapple']) result += 'H';

    return result;
  }
}
