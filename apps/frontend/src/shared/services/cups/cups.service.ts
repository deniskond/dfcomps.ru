import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CheckCupRegistrationInterface, CupInterface, OnlineCupInfoInterface } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class CupsService extends BackendService {
  public getNextCupInfo$(): Observable<CupInterface> {
    return this.get$(URL_PARAMS.CUP.GET_NEXTCUP);
  }

  public checkIfPlayerRegistered$(cupId: number): Observable<boolean> {
    return this.post$<CheckCupRegistrationInterface>(URL_PARAMS.CUP.CHECK_REGISTRATION(), { cupId }).pipe(
      map(({ isRegistered }) => isRegistered),
    );
  }

  public getOnlineCupInfo$(cupId: number): Observable<OnlineCupInfoInterface> {
    return this.get$<OnlineCupInfoInterface>(URL_PARAMS.CUP.ONLINE_CUP_INFO(cupId));
  }
}
