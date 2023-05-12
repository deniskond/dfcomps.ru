import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isEqual } from 'lodash';
import { NewsInterfaceUnion } from '~shared/types/news-union.type';
import { Languages } from '~shared/enums/languages.enum';
import { NewsTypes } from '~shared/enums/news-types.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { NewsService } from '~shared/services/news-service/news.service';

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

  constructor(private router: Router, private newsService: NewsService, private languageService: LanguageService) {}

  ngOnInit(): void {
    this.newsService.loadMainPageNews();
    this.initObservables();
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
}
