import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { NewsInterfaceUnion } from '@dfcomps/contracts';

@Component({
  selector: 'app-news-social-links',
  templateUrl: './news-social-links.component.html',
  styleUrls: ['./news-social-links.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSocialLinksComponent implements OnInit, OnDestroy {
  @Input() news: NewsInterfaceUnion;

  public telegramShareLink$: Observable<string>;
  public twitterShareLink$: Observable<string>;
  private onDestroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.initLinkObservables();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private initLinkObservables(): void {
    const mappedHeader$ = this.languageService
      .getLanguage$()
      .pipe(map((language: Languages) => (language === Languages.EN ? this.news.headerEn : this.news.header)));

    this.telegramShareLink$ = mappedHeader$.pipe(
      map(
        (header: string) =>
          `https://t.me/share/url?url=https://dfcomps.ru/news/${this.news.id}&text=${encodeURIComponent(header)}`,
      ),
    );

    this.twitterShareLink$ = mappedHeader$.pipe(
      map(
        (header: string) =>
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(header)} https://dfcomps.ru/news/${this.news.id}`,
      ),
    );
  }
}
