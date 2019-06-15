import { URL_PARAMS } from '../../configs/url-params.config';
import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { Observable } from 'rxjs';
import { NewsInterfaceUnion } from '../../types/news-union.type';

@Injectable()
export class NewsService extends BackendService {
    public getMainPageNews$(): Observable<NewsInterfaceUnion> {
        return this.post$(URL_PARAMS.NEWS.MAIN_PAGE);
    }
}
