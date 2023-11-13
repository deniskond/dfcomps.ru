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
  WorldspawnMapInfoInterface,
  UploadedFileLinkInterface,
  AdminEditOfflineCupInterface,
  UpdateCupDto,
  AddCupDto,
} from '@dfcomps/contracts';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  private news: AdminNewsListInterface[];
  private cups: AdminCupInterface[];

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

  public getSingleCup$(cupId: number): Observable<AdminEditOfflineCupInterface> {
    return this.backendService.get$<AdminEditOfflineCupInterface>(URL_PARAMS.ADMIN.GET_SINGLE_CUP(cupId));
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
      reason: formValue['reason_' + demoId]!.toString(),
    }));

    const processValidationDto = {
      validationResults: JSON.stringify(validationResults) as any,
      allDemosCount: demosIds.length,
    };

    return this.backendService.post$<void>(URL_PARAMS.ADMIN.PROCESS_VALIDATION(cupId), processValidationDto);
  }

  public postSimpleNews$(formValue: Record<string, any>): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.POST_NEWS, this.getAdminNewsDto(formValue));
  }

  public getSingleNews$(newsId: string): Observable<AdminEditNewsInterface> {
    return this.backendService.get$<AdminEditNewsInterface>(URL_PARAMS.ADMIN.GET_SINGLE_NEWS(newsId));
  }

  public editSimpleNews$(formValue: Record<string, any>, newsId: string): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.UPDATE_NEWS(newsId), this.getAdminNewsDto(formValue));
  }

  public getAllActiveMulticups$(): Observable<AdminActiveMulticupInterface[]> {
    return this.backendService.get$<AdminActiveMulticupInterface[]>(URL_PARAMS.ADMIN.GET_ALL_ACTIVE_MULTICUPS);
  }

  public addCup$(formValue: Record<string, any>): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.ADD_CUP, {
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
    } as AddCupDto);
  }

  public editCup$(formValue: Record<string, any>, cupId: number): Observable<void> {
    const updateCupDto: UpdateCupDto = {
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

    return this.backendService.post$<void>(URL_PARAMS.ADMIN.UPDATE_CUP(cupId), updateCupDto);
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

  public getWorldspawnMapInfo$(map: string): Observable<WorldspawnMapInfoInterface> {
    return this.backendService.get$<WorldspawnMapInfoInterface>(URL_PARAMS.ADMIN.GET_WORLDSPAWN_MAP_INFO, {
      map,
    });
  }

  public addCustomMap$(map: File, mapName: string): Observable<UploadedFileLinkInterface> {
    return this.backendService.uploadFile$(URL_PARAMS.ADMIN.UPLOAD_MAP(mapName), [{ fileKey: 'file', file: map }]);
  }

  public addCustomLevelshot$(levelshot: File, mapName: string): Observable<UploadedFileLinkInterface> {
    return this.backendService.uploadFile$(URL_PARAMS.ADMIN.UPLOAD_LEVELSHOT(mapName), [
      { fileKey: 'file', file: levelshot },
    ]);
  }

  private getAdminNewsDto(formValue: Record<string, any>): AdminNewsDto {
    return {
      russianTitle: formValue['russianTitle'],
      englishTitle: formValue['englishTitle'],
      postingTime: formValue['timeOption'] === 'now' ? moment().format() : formValue['postingTime'],
      russianText: formValue['russianText'],
      englishText: formValue['englishText'],
      type: NewsTypes.SIMPLE,
      youtube: formValue['youtube'],
    };
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
