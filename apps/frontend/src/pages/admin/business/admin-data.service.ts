import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { URL_PARAMS } from '../../../app/configs/url-params.config';
import { BackendService } from '../../../app/services/backend-service/backend-service';
import { mapAdminCupsDtoToInterface } from '../mappers/admin-cups.mapper';
import { mapAdminNewsDtoToInterface } from '../mappers/admin-news.mapper';
import { AdminCupDto } from '../models/admin-cup.dto';
import { AdminCupInterface } from '../models/admin-cup.interface';
import { AdminNewsDto } from '../models/admin-news.dto';
import { AdminNewsInterface } from '../models/admin-news.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  private news: AdminNewsInterface[];
  private cups: AdminCupInterface[];

  constructor(private backendService: BackendService) {}

  public getAllNews$(): Observable<AdminNewsInterface[]> {
    if (this.news) {
      return of(this.news);
    }

    return this.backendService.post$<AdminNewsDto[]>(URL_PARAMS.ADMIN.GET_NEWS).pipe(
      map(mapAdminNewsDtoToInterface),
      tap((news: AdminNewsInterface[]) => (this.news = news)),
    );
  }

  public deleteNewsItem$(newsId: string): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.DELETE_NEWS(newsId));
  }

  public getAllCups$(): Observable<AdminCupInterface[]> {
    if (this.cups) {
      return of(this.cups);
    }

    return this.backendService.post$<AdminCupDto[]>(URL_PARAMS.ADMIN.GET_CUPS).pipe(
      map(mapAdminCupsDtoToInterface),
      tap((cups: AdminCupInterface[]) => (this.cups = cups)),
    );
  }

  public setCups(cups: AdminCupInterface[]): void {
    this.cups = cups;
  }

  public setNews(news: AdminNewsInterface[]): void {
    this.news = news;
  }
}
