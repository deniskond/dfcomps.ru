import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { URL_PARAMS } from '../../configs/url-params.config';
import { Observable } from 'rxjs';
import { UploadDemoDtoInterface } from './dto/upload-demo.dto';
import { UploadedDemoInterface } from '../../interfaces/uploaded-demo.interface';

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

    public deleteDemo$(demo: string, cupId: string): Observable<UploadedDemoInterface[]> {
        return this.post$(URL_PARAMS.DEMOS.DELETE,  {
            demo,
            cupId,
        });
    }

    public reflexUploadDemo$(
        demo: File,
        cupId: string,
        mapName: string,
        playerId: string,
        fileName: string,
    ): Observable<UploadDemoDtoInterface> {
        return this.uploadFile$(URL_PARAMS.DEMOS.REFLEX_UPLOAD, demo, {
            cupId,
            mapName,
            playerId,
            fileName,
        });
    }
}
