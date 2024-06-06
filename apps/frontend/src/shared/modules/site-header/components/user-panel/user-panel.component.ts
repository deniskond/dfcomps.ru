import { API_URL } from '~shared/rest-api';
import { UserInterface } from '../../../../interfaces/user.interface';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { UserService } from '../../../../services/user-service/user.service';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isNonNull } from '../../../../../shared/helpers/is-non-null';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { MapSuggestionComponent } from '../map-suggestion/map-suggestion.component';
import * as moment from 'moment';
import { getNextWarcupTime } from 'libs/helpers/src/lib/next-warcup-time.helper';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { LanguageService } from '~shared/services/language/language.service';

const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 0,
  touchendHideDelay: 0,
};

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.less'],
  providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPanelComponent implements OnInit, OnDestroy {
  public user$: Observable<UserInterface | null>;
  public apiUrl = API_URL;
  public isValidSuggestionTime = true;
  public suggestionHintText: string;

  private onDestroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.user$ = this.userService
      .getCurrentUser$()
      .pipe(tap((user: UserInterface | null) => this.checkIsValidSuggestionTime(user?.lastMapSuggestionTime || null)));

    this.languageService
      .getTranslations$()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((translations: Record<string, string>) => {
        this.suggestionHintText = translations['suggestionGrayHint'];
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onLoginClick(): void {
    this.dialog.open(LoginDialogComponent);
  }

  public onRegisterClick(): void {
    this.dialog.open(RegisterDialogComponent);
  }

  public onLogoutClick(): void {
    this.userService.logout();
  }

  public onProfileClick(): void {
    this.user$
      .pipe(filter(isNonNull), take(1))
      .subscribe((user: UserInterface) => this.router.navigate([`/profile/${user.id}`]));
  }

  public hasAdminPanelAccess(user: UserInterface): boolean {
    return checkUserRoles(user.roles, [UserRoles.VALIDATOR, UserRoles.CUP_ORGANIZER, UserRoles.NEWSMAKER]);
  }

  public onMapSuggestionClick(): void {
    this.dialog.open(MapSuggestionComponent, {
      data: {
        isAdmin: false,
      },
    });
  }

  public checkIsValidSuggestionTime(lastSuggestionTime: string | null): void {
    if (!lastSuggestionTime) {
      return;
    }

    this.isValidSuggestionTime = !moment(getNextWarcupTime()).subtract(1, 'week').isBefore(moment(lastSuggestionTime));
  }
}
