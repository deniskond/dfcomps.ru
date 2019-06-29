import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { URL_PARAMS } from '../../configs/url-params.config';
import { Observable } from 'rxjs';
import { UploadDemoDtoInterface } from './dto/upload-demo.dto';

@Injectable({
    providedIn: 'root',
})
export class DemosService extends BackendService {
    public uploadDemo$(
        demo: File,
        cupId: string,
        mapName: string,
        playerId: string,
        fileName: string,
    ): Observable<UploadDemoDtoInterface> {
        return this.uploadFile$(URL_PARAMS.DEMOS.UPLOAD, demo, {
            cupId,
            mapName,
            playerId,
            fileName,
        });
    }
}
