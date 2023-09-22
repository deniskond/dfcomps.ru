import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, map } from 'rxjs';
import { Languages } from '~shared/enums/languages.enum';
import { NewsTypes } from '~shared/enums/news-types.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { NewsService } from '~shared/services/news-service/news.service';
import { NewsInterfaceUnion } from '~shared/types/news-union.type';
import * as moment from 'moment';

@Component({
  templateUrl: './theme-news-page.component.html',
  styleUrls: ['./theme-news-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeNewsPageComponent {
  public news$: Observable<NewsInterfaceUnion[]>;
  public prepostedNews$: Observable<NewsInterfaceUnion[]>;
  public postedNews$: Observable<NewsInterfaceUnion[]>;
  public language$: Observable<Languages>;
  public newsTypes = NewsTypes;
  public languages = Languages;

  constructor(
    private newsService: NewsService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.newsService.loadThemePageNews('hangtime3');
    this.initObservables();
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }
  public reloadNews(): void {
    this.newsService.loadThemePageNews('hangtime3');
  }

  private initObservables(): void {
    this.news$ = this.newsService.getThemePageNews$('hangtime3').pipe(distinctUntilChanged(isEqual));
    this.postedNews$ = this.news$.pipe(
      map((news: NewsInterfaceUnion[]) => news.filter((newsElem: NewsInterfaceUnion) => !newsElem.preposted)),
    );
    this.language$ = this.languageService.getLanguage$();
  }
}
