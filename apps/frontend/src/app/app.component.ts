import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { isEqual } from 'lodash';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';
import { LanguageService } from '~shared/services/language/language.service';
import { DuelService } from '~shared/pages/1v1/services/duel.service';
import { ThemeService } from '~shared/services/theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
  public user$: Observable<UserInterface | null>;

  private onDestroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private languageService: LanguageService,
    private duelService: DuelService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser$();
    this.languageService.setLanguageFromCookie();
    this.themeService.setThemeFromCookie();
    this.initUserSubscriptions();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.duelService.closeConnection();
  }

  private initUserSubscriptions(): void {
    this.user$.pipe(distinctUntilChanged(isEqual), takeUntil(this.onDestroy$)).subscribe((user: UserInterface) => {
      if (user) {
        this.duelService.openConnection();

        return;
      }

      this.duelService.closeConnection();
    });
  }
}
