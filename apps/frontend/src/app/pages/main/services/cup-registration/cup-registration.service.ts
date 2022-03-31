import { URL_PARAMS } from '../../../../configs/url-params.config';
import { BackendService } from '../../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CupRegistrationService extends BackendService {
  public registerForCup$(cupId: string): Observable<void> {
    return this.post$(URL_PARAMS.CUP.REGISTER(cupId));
  }

  public cancelRegistrationForCup$(cupId: string): Observable<void> {
    return this.post$(URL_PARAMS.CUP.CANCEL_REGISTRATION(cupId));
  }
}
