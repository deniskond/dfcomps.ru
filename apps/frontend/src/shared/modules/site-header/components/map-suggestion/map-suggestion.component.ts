import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckPreviousCupsType, WorldspawnMapInfoInterface } from '@dfcomps/contracts';
import {
  ReplaySubject,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  finalize,
  of,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { CupsService } from '~shared/services/cups/cups.service';
import { LanguageService } from '~shared/services/language/language.service';
import { UserService } from '~shared/services/user-service/user.service';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-map-suggestion',
  templateUrl: './map-suggestion.component.html',
  styleUrls: ['./map-suggestion.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapSuggestionComponent implements OnInit, OnDestroy {
  public isPristine = true;
  public wasPlayedBefore = false;
  public isNotFoundOnWS = false;
  public isLoading = false;
  public mapName = '';
  public mapInfo: WorldspawnMapInfoInterface | null = null;
  public previousCupName: string | null = null;
  public mapWeapons: string;

  private mapName$ = new ReplaySubject<string>(1);
  private onDestroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<MapSuggestionComponent>,
    private cupsService: CupsService,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private languageService: LanguageService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.setMapnameInputSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public get isInvalid(): boolean {
    return this.isNotFoundOnWS || this.wasPlayedBefore || !this.mapName;
  }

  public onMapnameInput(): void {
    this.mapName$.next(this.mapName);
  }

  public sendSuggestion(): void {
    this.isLoading = true;

    this.cupsService
      .suggestMap$(this.mapName)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.snackBar.open('Error', error.error.message, { duration: 3000 });

          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(() => {
        this.dialogRef.close();
        this.userService.updatePartialUserInfo({ lastMapSuggestionTime: moment().format() });

        this.languageService
          .getTranslations$()
          .pipe(take(1))
          .subscribe((translations: Record<string, string>) =>
            this.snackBar.open(translations['mapSuggested'], 'OK', { duration: 3000 }),
          );
      });
  }

  private setMapnameInputSubscription(): void {
    this.mapName$
      .pipe(
        filter((mapName: string) => !!mapName),
        tap(() => {
          this.isLoading = true;
        }),
        debounceTime(2000),
        tap(() => {
          this.isPristine = false;
        }),
        switchMap((mapName: string) =>
          combineLatest([
            this.cupsService.getWorldspawnMapInfo$(mapName).pipe(catchError(() => of(null))),
            this.cupsService.checkPreviousCups$(mapName),
          ]),
        ),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.onDestroy$),
      )
      .subscribe(([mapInfo, previosCupsInfo]: [WorldspawnMapInfoInterface | null, CheckPreviousCupsType]) => {
        this.isNotFoundOnWS = !mapInfo;
        this.mapInfo = mapInfo;
        this.wasPlayedBefore = previosCupsInfo.wasOnCompetition;
        this.previousCupName = previosCupsInfo.wasOnCompetition ? previosCupsInfo.lastCompetition : null;

        if (mapInfo) {
          this.mapWeapons = this.mapWeaponsToString(mapInfo.weapons);
        }

        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  private mapWeaponsToString(weapons: WorldspawnMapInfoInterface['weapons']): string {
    let weaponsString = '';

    if (weapons['gauntlet']) weaponsString += 'U';
    if (weapons['rocket']) weaponsString += 'R';
    if (weapons['shotgun']) weaponsString += 'S';
    if (weapons['railgun']) weaponsString += 'I';
    if (weapons['lightning']) weaponsString += 'L';
    if (weapons['grenade']) weaponsString += 'G';
    if (weapons['plasma']) weaponsString += 'P';
    if (weapons['bfg']) weaponsString += 'B';
    if (weapons['grapple']) weaponsString += 'H';

    return weaponsString;
  }
}
