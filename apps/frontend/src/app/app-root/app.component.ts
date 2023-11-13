import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { isEqual } from 'lodash';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';
import { LanguageService } from '~shared/services/language/language.service';
import { ThemeService } from '~shared/services/theme/theme.service';
import { DuelService } from '~pages/1v1/services/duel.service';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private matIconRegistry: MatIconRegistry,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userService.restoreAuthInfo();
    this.user$ = this.userService.getCurrentUser$();
    this.languageService.setLanguageFromCookie();
    this.themeService.setThemeFromCookie();
    this.initUserSubscriptions();
    this.registerMatIcons();
    this.userService.tryLoginFromCookie();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.duelService.closeConnection();
  }

  private initUserSubscriptions(): void {
    this.user$.pipe(distinctUntilChanged(isEqual), takeUntil(this.onDestroy$)).subscribe((user: UserInterface) => {
      if (user) {
        this.userService
          .checkDiscordPrompt$()
          .pipe(filter((prompt) => !!prompt))
          .subscribe(() => this.openDiscordPrompt());
        this.duelService.openConnection();

        return;
      }

      this.duelService.closeConnection();
    });
  }

  private registerMatIcons(): void {
    this.matIconRegistry.addSvgIcon('discord', 'apps/frontend/assets/images/discord.svg');
  }

  private openDiscordPrompt(): void {
    this.languageService.getTranslations$().subscribe((translations: Record<string, string>) => {
      const snackBar = this.snackBar.open(translations['doYouWantToLinkDiscord'], translations['yes'], {
        duration: 10000,
      });

      snackBar
        .onAction()
        .pipe(take(1))
        .subscribe(
          () =>
            (window.location.href =
              'https://discord.com/oauth2/authorize?response_type=token&client_id=1154028126783946772&scope=identify&state=link'),
        );
    });
  }
}
