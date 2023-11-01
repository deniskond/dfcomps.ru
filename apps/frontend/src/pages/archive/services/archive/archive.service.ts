import { Injectable } from '@angular/core';
import { ArchiveNewsInterface, PaginationCountInterface } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService, URL_PARAMS } from '~shared/rest-api';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService extends BackendService {
  public getArchiveNews$(startIndex: number, endIndex: number): Observable<ArchiveNewsInterface[]> {
    return this.get$(URL_PARAMS.NEWS.ARCHIVE(startIndex, endIndex));
  }

  public getNewsCount$(): Observable<number> {
    return this.get$<PaginationCountInterface>(URL_PARAMS.NEWS.COUNT).pipe(map(({ count }) => count));
  }
}
