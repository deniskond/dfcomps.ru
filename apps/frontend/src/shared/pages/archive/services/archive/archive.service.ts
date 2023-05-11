import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArchiveNewsInterface } from '../../interfaces/archive-news.interface';
import { BackendService, URL_PARAMS } from '~shared/rest-api';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService extends BackendService {
  public getArchiveNews$(startIndex: number, endIndex: number): Observable<ArchiveNewsInterface[]> {
    return this.post$(URL_PARAMS.NEWS.ARCHIVE(startIndex, endIndex));
  }

  public getNewsCount$(): Observable<number> {
    return this.post$<{ count: number }>(URL_PARAMS.NEWS.COUNT).pipe(map(({ count }) => count));
  }
}
