import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, map, switchMap, take } from 'rxjs';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { NewsService } from '~shared/services/news-service/news.service';
import * as moment from 'moment';
import { ActivatedRoute, Params } from '@angular/router';
import { NewsInterfaceUnion, NewsTypes } from '@dfcomps/contracts';

@Component({
  templateUrl: './theme-news-page.component.html',
  styleUrls: ['./theme-news-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeNewsPageComponent {
  public news$: Observable<NewsInterfaceUnion[]>;
  public postedNews$: Observable<NewsInterfaceUnion[]>;
  public language$: Observable<Languages>;
  public newsTypes = NewsTypes;
  public languages = Languages;

  constructor(
    private newsService: NewsService,
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(take(1))
      .subscribe(({ theme }: Params) => this.newsService.loadThemePageNews(theme));

    this.initObservables();
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }
  public reloadNews(): void {
    this.activatedRoute.params
      .pipe(take(1))
      .subscribe(({ theme }: Params) => this.newsService.loadThemePageNews(theme));
  }

  private initObservables(): void {
    this.news$ = this.activatedRoute.params.pipe(
      take(1),
      switchMap(({ theme }: Params) => this.newsService.getThemePageNews$(theme)),
      distinctUntilChanged(isEqual),
    );

    this.postedNews$ = this.news$.pipe(
      map((news: NewsInterfaceUnion[]) => news.filter((newsElem: NewsInterfaceUnion) => !newsElem.preposted)),
    );
    this.language$ = this.languageService.getLanguage$();
  }
}
