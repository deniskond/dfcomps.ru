import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable } from 'rxjs';
import { UploadDemoResponseInterface, UploadedDemoInterface } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class DemosService extends BackendService {
  public uploadDemo$(
    demo: File,
    cupId: number,
    mapName: string,
    playerId: number,
    fileName: string,
  ): Observable<UploadDemoResponseInterface> {
    return this.uploadFile$(URL_PARAMS.DEMOS.UPLOAD, [{ fileKey: 'file', file: demo }], {
      cupId,
      mapName,
      playerId,
      fileName,
    });
  }

  public deleteDemo$(demoName: string, cupId: string): Observable<UploadedDemoInterface[]> {
    return this.post$(URL_PARAMS.DEMOS.DELETE, {
      demoName,
      cupId,
    });
  }

  public uploadDuelDemo$(demo: File): Observable<UploadDemoResponseInterface> {
    return this.uploadFile$(URL_PARAMS.DEMOS.DUEL_UPLOAD, [{ fileKey: 'file', file: demo }]);
  }
}
