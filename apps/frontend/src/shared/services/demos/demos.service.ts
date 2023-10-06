import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable } from 'rxjs';
import { UploadDemoDtoInterface } from './dto/upload-demo.dto';
import { UploadedDemoInterface } from '@dfcomps/contracts';


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
  ): Observable<UploadDemoDtoInterface> {
    return this.uploadFile$(URL_PARAMS.DEMOS.UPLOAD, [{ fileKey: 'file', file: demo }], {
      cupId,
      mapName,
      playerId,
      fileName,
    });
  }

  public deleteDemo$(demo: string, cupId: string): Observable<UploadedDemoInterface[]> {
    return this.post$(URL_PARAMS.DEMOS.DELETE, {
      demo,
      cupId,
    });
  }

  public uploadDuelDemo$(demo: File): Observable<UploadDemoDtoInterface> {
    return this.uploadFile$(URL_PARAMS.DEMOS.DUEL_UPLOAD, [{ fileKey: 'file', file: demo }]);
  }
}
