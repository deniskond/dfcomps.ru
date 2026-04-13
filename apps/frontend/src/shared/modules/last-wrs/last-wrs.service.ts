import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { WrLastFiveItemInterface } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class LastWrsService extends BackendService {
  public getLastFive$(physics: string): Observable<WrLastFiveItemInterface[]> {
    return this.get$<WrLastFiveItemInterface[]>(URL_PARAMS.WORLD_RECORDS.LAST_FIVE(physics));
  }
}
