import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import {
  Physics,
  UploadDemoResponseInterface,
  WrLastFiveItemInterface,
  WrListResponseInterface,
  WrPlayerSearchItemInterface,
} from '@dfcomps/contracts';

@Injectable()
export class WrDatabaseService extends BackendService {
  public getWrList$(page: number, filter: string, physics: string): Observable<WrListResponseInterface> {
    return this.get$<WrListResponseInterface>(URL_PARAMS.WORLD_RECORDS.LIST(page, filter, physics));
  }

  public getLastFive$(physics: Physics): Observable<WrLastFiveItemInterface[]> {
    return this.get$<WrLastFiveItemInterface[]>(URL_PARAMS.WORLD_RECORDS.LAST_FIVE(physics));
  }

  public searchPlayers$(nick: string): Observable<WrPlayerSearchItemInterface[]> {
    return this.get$<WrPlayerSearchItemInterface[]>(URL_PARAMS.WORLD_RECORDS.SEARCH_PLAYERS(nick));
  }

  public uploadWrDemo$(demo: File, playerType: string, userId?: number): Observable<UploadDemoResponseInterface> {
    const postParams: Record<string, any> = { playerType };

    if (userId !== undefined) {
      postParams['userId'] = userId;
    }

    return this.uploadFile$(URL_PARAMS.WORLD_RECORDS.UPLOAD, [{ fileKey: 'demo', file: demo }], postParams);
  }
}
