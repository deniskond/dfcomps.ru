import { LanguageService } from './../../services/language/language.service';
import { Languages } from '../../enums/languages.enum';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DownloadDfDialogComponent } from './components/download-df-dialog/download-df-dialog.component';
import { Themes } from '~shared/enums/themes.enum';
import { ThemeService } from '~shared/services/theme/theme.service';
import { TABS_CONFIG, TabInterface } from '~shared/configs/tabs.config';
import { NavigationPages } from '~shared/enums/pages.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  public pages = NavigationPages;
  public tabs = TABS_CONFIG.TABS;
  public languages = Languages;
  public themes = Themes;
  public activePage: NavigationPages | null;
  public translations: Record<string, string>;
  public language$: Observable<Languages>;
  public theme$: Observable<Themes>;

  private onDestroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setActivePage();
    this.initActivePageSubscription();
    this.language$ = this.languageService.getLanguage$();
    this.theme$ = this.themeService.getTheme$();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public navigate(page: NavigationPages): void {
    this.router.navigate([`/${page}`]);
  }

  public onDownloadDefragClick(): void {
    this.dialog.open(DownloadDfDialogComponent);
  }

  public toggleLanguage(): void {
    this.languageService
      .getLanguage$()
      .pipe(take(1))
      .subscribe((language: Languages) =>
        language === Languages.EN
          ? this.languageService.setLanguage(Languages.RU)
          : this.languageService.setLanguage(Languages.EN),
      );
  }

  public toggleTheme(): void {
    this.themeService
      .getTheme$()
      .pipe(take(1))
      .subscribe((theme: Themes) =>
        theme === Themes.LIGHT ? this.themeService.setTheme(Themes.DARK) : this.themeService.setTheme(Themes.LIGHT),
      );
  }

  private initActivePageSubscription(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.onDestroy$),
      )
      .subscribe(() => {
        this.setActivePage();
        this.changeDetectorRef.markForCheck();
      });
  }

  private setActivePage(): void {
    const activeTab: TabInterface | undefined = this.tabs.find(
      ({ page }: TabInterface) => page && this.router.url.indexOf(page) !== -1,
    );

    if (this.router.url === '/') {
      if (this.activePage === null) {
        this.activePage = NavigationPages.MOVIES;
      }

      setTimeout(() => {
        this.activePage = NavigationPages.MAIN;
        this.changeDetectorRef.markForCheck();
      }, 0); // nav-tab bug workaround: tab will be unfocused when switched from null value

      return;
    }

    if (this.router.url.includes('news')) {
      this.activePage = NavigationPages.NEWS;

      return;
    }

    if (activeTab) {
      this.activePage = activeTab.page;

      return;
    }

    this.activePage = null;
  }
}
