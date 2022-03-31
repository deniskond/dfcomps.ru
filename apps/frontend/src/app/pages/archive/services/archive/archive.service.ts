import { URL_PARAMS } from '../../../../configs/url-params.config';
import { BackendService } from '../../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArchiveNewsInterface } from '../../interfaces/archive-news.interface';

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
