import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { URL_PARAMS } from '../../../app/configs/url-params.config';
import { BackendService } from '../../../app/services/backend-service/backend-service';
import { mapAdminNewsDtoToInterface } from '../mappers/admin-news.mapper';
import { AdminNewsDto } from '../models/admin-news.dto';
import { AdminNewsInterface } from '../models/admin-news.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  constructor(private backendService: BackendService) {}

  public getAllNews$(): Observable<AdminNewsInterface[]> {
    return this.backendService.post$<AdminNewsDto[]>(URL_PARAMS.ADMIN.GET_NEWS).pipe(map(mapAdminNewsDtoToInterface));
  }

  public deleteNewsItem$(newsId: string): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.DELETE_NEWS(newsId));
  }
}
