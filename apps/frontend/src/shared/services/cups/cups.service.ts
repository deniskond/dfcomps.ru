import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CheckCupRegistrationInterface,
  CheckPreviousCupsType,
  CupInterface,
  OnlineCupInfoInterface,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';

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

  public getOnlineCupInfo$(uuid: string): Observable<OnlineCupInfoInterface> {
    return this.get$<OnlineCupInfoInterface>(URL_PARAMS.CUP.ONLINE_CUP_INFO(uuid));
  }

  public suggestMap$(mapName: string): Observable<void> {
    return this.post$<void>(URL_PARAMS.CUP.SUGGEST, { mapName });
  }

  public checkPreviousCups$(mapName: string): Observable<CheckPreviousCupsType> {
    return this.get$<CheckPreviousCupsType>(URL_PARAMS.CUP.CHECK_PREVIOUS_CUPS(mapName));
  }

  public getWorldspawnMapInfo$(map: string): Observable<WorldspawnMapInfoInterface> {
    return this.get$<WorldspawnMapInfoInterface>(URL_PARAMS.CUP.GET_WORLDSPAWN_MAP_INFO, {
      map,
    });
  }
}
