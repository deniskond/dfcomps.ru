import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CupRegistrationService extends BackendService {
  public registerForCup$(cupId: number): Observable<void> {
    return this.post$(URL_PARAMS.CUP.REGISTER(cupId));
  }

  public cancelRegistrationForCup$(cupId: number): Observable<void> {
    return this.post$(URL_PARAMS.CUP.CANCEL_REGISTRATION(cupId));
  }
}
