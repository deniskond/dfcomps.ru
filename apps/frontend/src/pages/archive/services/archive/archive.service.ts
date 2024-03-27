import { Injectable } from '@angular/core';
import { ArchiveNewsResultInterface } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { BackendService, URL_PARAMS } from '~shared/rest-api';

@Injectable({
  providedIn: 'root',
})
export class ArchiveService extends BackendService {
  public getArchiveNews$(startIndex: number, endIndex: number): Observable<ArchiveNewsResultInterface> {
    return this.get$(URL_PARAMS.NEWS.ARCHIVE(startIndex, endIndex));
  }
}
