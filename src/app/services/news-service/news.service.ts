import { URL_PARAMS } from '../../configs/url-params.config';
import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { Observable, ReplaySubject } from 'rxjs';
import { NewsInterfaceUnion } from '../../types/news-union.type';

@Injectable()
export class NewsService extends BackendService {
    private _mainPageNews$ = new ReplaySubject<NewsInterfaceUnion[]>(1);

    // TODO эту штуку только в крайнем случае вызывать
    public loadMainPageNews(): void {
        this.post$(URL_PARAMS.NEWS.MAIN_PAGE).subscribe((news: NewsInterfaceUnion[]) => this._mainPageNews$.next(news));
    }

    public getMainPageNews$(): Observable<NewsInterfaceUnion[]> {
        return this._mainPageNews$.asObservable();
    }
}
