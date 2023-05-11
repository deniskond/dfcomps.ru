import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, BehaviorSubject } from 'rxjs';
import { NewsInterfaceUnion } from '../../types/news-union.type';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class NewsService extends BackendService {
  private _mainPageNews$ = new BehaviorSubject<NewsInterfaceUnion[] | null>(null);
  private isLoading = false;

  // TODO эту штуку только в крайнем случае вызывать
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

  public getSingleNews$(id: string): Observable<NewsInterfaceUnion> {
    return this.post$(URL_PARAMS.NEWS.SINGLE_NEWS(id));
  }

  public getDemosForValidation$(cupId: string): Observable<{ url: string }> {
    return this.post$(URL_PARAMS.DEMOS.VALIDATION_ARCHIVE_LINK, {
      cupId,
    });
  }
}
