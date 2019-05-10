import { URL_PARAMS } from '../../../configs/url-params.config';
import { BackendService } from '../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ProfileService extends BackendService {
    public getProfile$(playerId: string): Observable<any> {
        return this.get(URL_PARAMS.PROFILE(playerId));
    }
}
