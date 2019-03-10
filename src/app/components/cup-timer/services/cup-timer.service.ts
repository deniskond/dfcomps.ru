import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../../../services/backend-service';
import { URL_PARAMS } from '../../../configs/url-params.config';

@Injectable()
export class CupTimerService extends BackendService {
    public getTime(): Observable<number> {
        return this.get(URL_PARAMS.TIMER.GET_TIME);
    }
}
