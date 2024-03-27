import { Injectable } from '@angular/core';
import { ArchiveNewsFilter, ArchiveNewsResultInterface, NewsArchiveFilterDto } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { BackendService, URL_PARAMS } from '~shared/rest-api';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService extends BackendService {
  public getArchiveNews$(
    startIndex: number,
    endIndex: number,
    filter: ArchiveNewsFilter,
  ): Observable<ArchiveNewsResultInterface> {
    return this.post$(URL_PARAMS.NEWS.ARCHIVE, {
      startIndex,
      endIndex,
      filter,
    } as NewsArchiveFilterDto);
  }
}
