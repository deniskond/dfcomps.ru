import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { NewsService } from '~shared/services/news-service/news.service';
import { MatDialog } from '@angular/material/dialog';
import { NewDiscordAccountComponent } from '~shared/modules/site-header';
import { UserService } from '~shared/services/user-service/user.service';
import { NewsInterfaceUnion, NewsTypes } from '@dfcomps/contracts';

@Component({
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
  public news$: Observable<NewsInterfaceUnion[]>;
  public prepostedNews$: Observable<NewsInterfaceUnion[]>;
  public postedNews$: Observable<NewsInterfaceUnion[]>;
  public language$: Observable<Languages>;
  public newsTypes = NewsTypes;
  public languages = Languages;
  public showPrepostedNews = false;

  constructor(
    private router: Router,
    private newsService: NewsService,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.newsService.loadMainPageNews();
    this.initObservables();
    this.checkDiscordOauth();
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }

  public reloadNews(): void {
    this.newsService.loadMainPageNews();
  }

  public navigateToArchive(): void {
    this.router.navigate(['/archive']);
  }

  private initObservables(): void {
    this.news$ = this.newsService.getMainPageNews$().pipe(distinctUntilChanged(isEqual));
    this.postedNews$ = this.news$.pipe(
      map((news: NewsInterfaceUnion[]) => news.filter((newsElem: NewsInterfaceUnion) => !newsElem.preposted)),
    );
    this.prepostedNews$ = this.news$.pipe(
      map((news: NewsInterfaceUnion[]) => news.filter((newsElem: NewsInterfaceUnion) => newsElem.preposted)),
    );
    this.language$ = this.languageService.getLanguage$();
  }

  private checkDiscordOauth(): void {
    const discordAccessToken: string | null = localStorage.getItem('discordAccessToken');
    const discordOAuthState: string | null = localStorage.getItem('discordOAuthState');

    if (!discordAccessToken || !discordOAuthState) {
      return;
    }

    localStorage.removeItem('discordAccessToken');
    localStorage.removeItem('discordOAuthState');

    if (discordOAuthState === 'login') {
      this.userService.loginByDiscord$(discordAccessToken).subscribe({
        error: () => {
          this.dialog.open(NewDiscordAccountComponent, {
            data: {
              isFirstStep: true,
              discordAccessToken,
            },
          });
        },
      });
    } else if (discordOAuthState === 'register') {
      this.dialog.open(NewDiscordAccountComponent, {
        data: {
          isFirstStep: false,
          discordAccessToken,
        },
      });
    }
  }
}
