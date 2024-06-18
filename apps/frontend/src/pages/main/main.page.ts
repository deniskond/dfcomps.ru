import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isEqual } from 'lodash';
import { NewsService } from '~shared/services/news-service/news.service';
import { MatDialog } from '@angular/material/dialog';
import { NewDiscordAccountComponent } from '~shared/modules/site-header';
import { UserService } from '~shared/services/user-service/user.service';
import { Languages, NewsInterfaceUnion } from '@dfcomps/contracts';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
  public news$: Observable<NewsInterfaceUnion[]>;
  public prepostedNews$: Observable<NewsInterfaceUnion[]>;
  public postedNews$: Observable<NewsInterfaceUnion[]>;
  public languages = Languages;
  public showPrepostedNews = false;

  constructor(
    private router: Router,
    private newsService: NewsService,
    private dialog: MatDialog,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.newsService.loadMainPageNews();
    this.initObservables();
    this.checkDiscordOauth();
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
    } else if (discordOAuthState === 'link') {
      this.userService.linkDiscord$(discordAccessToken).subscribe({
        next: () => {
          this.snackBar.open(`Successfully linked Discord account!`, '', {
            duration: 2000,
          });
        },
        error: (error: Error) => {
          this.snackBar.open(`Error linking Discord account - ${error.message}`, '', {
            duration: 2000,
          });
        },
      });
    }
  }
}
