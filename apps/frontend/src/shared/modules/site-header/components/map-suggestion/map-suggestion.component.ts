import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckPreviousCupsType, ParsedMapInfoInterface } from '@dfcomps/contracts';
import {
  Observable,
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
import { mapWeaponsToString } from '@dfcomps/helpers';
import { AdminWarcupDataService } from '~pages/admin/business/admin-warcup-data.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { checkUserRoles, UserRoles } from '@dfcomps/auth';

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
  public mapInfo: ParsedMapInfoInterface | null = null;
  public previousCupName: string | null = null;
  public mapWeapons: string;

  private mapName$ = new ReplaySubject<string>(1);
  private onDestroy$ = new Subject<void>();
  private user: UserInterface | null = null;

  constructor(
    public dialogRef: MatDialogRef<MapSuggestionComponent>,
    private cupsService: CupsService,
    private adminWarcupDataService: AdminWarcupDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private languageService: LanguageService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { isAdmin: boolean },
  ) {}

  ngOnInit(): void {
    this.setMapnameInputSubscription();
    this.userService
      .getCurrentUser$()
      .pipe(take(1))
      .subscribe((user: UserInterface | null) => (this.user = user));
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public get isInvalid(): boolean {
    return this.isNotFoundOnWS || (this.wasPlayedBefore && !this.data.isAdmin) || !this.mapName;
  }

  public onMapnameInput(): void {
    this.mapName$.next(this.mapName);
  }

  public sendSuggestion(): void {
    this.isLoading = true;

    const targetEndpointMethod$: Observable<void> = this.data.isAdmin
      ? this.adminWarcupDataService.adminSuggest$(this.mapName)
      : this.cupsService.suggestMap$(this.mapName);

    targetEndpointMethod$
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

        if (!this.user || !checkUserRoles(this.user.roles, [UserRoles.WARCUP_ADMIN])) {
          this.userService.updatePartialUserInfo({ lastMapSuggestionTime: moment().format() });
        }

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
            this.cupsService.getParsedMapInfo$(mapName).pipe(catchError(() => of(null))),
            this.cupsService.checkPreviousCups$(mapName),
          ]),
        ),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.onDestroy$),
      )
      .subscribe(([mapInfo, previosCupsInfo]: [ParsedMapInfoInterface | null, CheckPreviousCupsType]) => {
        this.isNotFoundOnWS = !mapInfo;
        this.mapInfo = mapInfo;
        this.wasPlayedBefore = previosCupsInfo.wasOnCompetition;
        this.previousCupName = previosCupsInfo.wasOnCompetition ? previosCupsInfo.lastCompetition : null;

        if (mapInfo) {
          this.mapWeapons = mapWeaponsToString(mapInfo.weapons);
        }

        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }
}
