import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { URL_PARAMS } from '../../../app/configs/url-params.config';
import { BackendService } from '../../../app/services/backend-service/backend-service';
import { mapAdminCupsDtoToInterface } from '../mappers/admin-cups.mapper';
import { mapAdminNewsDtoToInterface } from '../mappers/admin-news.mapper';
import { AdminValidationInterface } from '../models/admin-validation.interface';
import { AdminCupDto } from '../models/admin-cup.dto';
import { AdminCupInterface } from '../models/admin-cup.interface';
import { AdminNewsDto } from '../models/admin-news.dto';
import { AdminNewsInterface } from '../models/admin-news.interface';
import { AdminValidationDto } from '../models/admin-validation.dto';
import { mapAdminValidationDtoToInterface } from '../mappers/admin-validation.mapper';

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

  public getCupValidationInfo$(newsId: string): Observable<AdminValidationInterface> {
    return this.backendService
      .post$<AdminValidationDto>(URL_PARAMS.ADMIN.CUP_VALIDATION(newsId))
      .pipe(map(mapAdminValidationDtoToInterface));
  }

  public setCups(cups: AdminCupInterface[]): void {
    this.cups = cups;
  }

  public setNews(news: AdminNewsInterface[]): void {
    this.news = news;
  }

  public sendValidationResult$(formValue: Record<string, boolean | string>, cupId: string): Observable<void> {
    const demosIds: string[] = Object.keys(formValue).reduce((acc: string[], controlKey) => {
      if (controlKey.match(/demo/)) {
        acc.push(controlKey.split('_')[1]);
      }

      return acc;
    }, []);

    const postParams: Record<string, string> = demosIds.reduce((acc, demoId: string, index) => {
      return {
        ...acc,
        [index + 1 + '_id']: demoId,
        [index + 1 + '_valid']: this.getDemoValidationResult(formValue['demo_' + demoId] as boolean | null),
        [index + 1 + '_reason']: formValue['reason_' + demoId].toString(),
      };
    }, {});

    return this.backendService.post$<void>(URL_PARAMS.ADMIN.PROCESS_VALIDATE, {
      ...postParams,
      count: demosIds.length.toString(),
      cup_id: cupId,
    });
  }

  public postSimpleNews$(formValue: Record<string, any>): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.POST_NEWS, {
      header: formValue['russianTitle'],
      header_en: formValue['englishTitle'],
      posting_time: formValue['timeOption'],
      datetime: formValue['postingTime'],
      text: formValue['russianText'],
      text_en: formValue['englishText'],
      type_id: '3',
    });
  }

  // TODO Admin news typization
  public getSingleNews$(newsId: string): Observable<any> {
    return this.backendService.post$<any>(URL_PARAMS.ADMIN.GET_SINGLE_NEWS(newsId));
  }

  public editSimpleNews$(formValue: Record<string, any>, newsId: string): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.EDIT_NEWS(newsId), {
      header: formValue['russianTitle'],
      header_en: formValue['englishTitle'],
      posting_time: formValue['timeOption'],
      datetime: formValue['postingTime'],
      text: formValue['russianText'],
      text_en: formValue['englishText'],
    });
  }

  private getDemoValidationResult(value: boolean | null): string {
    if (value === null) {
      return '0';
    }

    if (value === true) {
      return '1';
    }

    return '2';
  }
}
