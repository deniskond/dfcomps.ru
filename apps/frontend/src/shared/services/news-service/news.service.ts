import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, BehaviorSubject } from 'rxjs';
import { NewsInterfaceUnion } from '../../types/news-union.type';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class NewsService extends BackendService {
  private _mainPageNews$ = new BehaviorSubject<NewsInterfaceUnion[] | null>(null);
  private _themePageNews$ = new BehaviorSubject<NewsInterfaceUnion[] | null>(null);
  private isLoading = false;

  // TODO This should be called as rare as possible
  public loadMainPageNews(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.post$<NewsInterfaceUnion[]>(URL_PARAMS.NEWS.MAIN_PAGE)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((news: NewsInterfaceUnion[]) => this._mainPageNews$.next(news));
  }

  public getMainPageNews$(): Observable<NewsInterfaceUnion[] | null> {
    return this._mainPageNews$.pipe(
      tap((news: NewsInterfaceUnion[] | null) => {
        if (!news) {
          this.loadMainPageNews();
        }

        return news;
      }),
    );
  }

  // TODO Not scalable at all, needs to be rewritten; for more than one theme there will be wrong caching
  public loadThemePageNews(theme: string): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.post$<NewsInterfaceUnion[]>(URL_PARAMS.NEWS.THEME_PAGE(theme))
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((news: NewsInterfaceUnion[]) => this._themePageNews$.next(news));
  }

  public getThemePageNews$(theme: string): Observable<NewsInterfaceUnion[] | null> {
    return this._themePageNews$.pipe(
      tap((news: NewsInterfaceUnion[] | null) => {
        if (!news) {
          this.loadThemePageNews(theme);
        }

        return news;
      }),
    );
  }

  public getSingleNews$(id: string): Observable<NewsInterfaceUnion> {
    return this.post$(URL_PARAMS.NEWS.SINGLE_NEWS(id));
  }

  public getDemosForValidation$(cupId: string): Observable<{ url: string }> {
    return this.post$(URL_PARAMS.DEMOS.VALIDATION_ARCHIVE_LINK, {
      cupId,
    });
  }
}
