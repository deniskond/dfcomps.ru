import { CupInterface } from '../../interfaces/cup.interface';
import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '@frontend/shared/rest-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CupsService extends BackendService {
  public getNextCupInfo$(): Observable<CupInterface> {
    return this.post$(URL_PARAMS.CUP.GET_NEXTCUP);
  }

  public checkIfPlayerRegistered$(cupId: string, playerId: string): Observable<boolean> {
    return this.post$<{ isRegistered: boolean }>(URL_PARAMS.CUP.CHECK_REGISTRATION(cupId, playerId)).pipe(
      map(({ isRegistered }) => isRegistered),
    );
  }
}
