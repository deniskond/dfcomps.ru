import { Physics } from '../../../enums/physics.enum';
import { BackendService, URL_PARAMS } from '@frontend/shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MulticupRoundInterface } from '../interfaces/multicup-round.interface';
import { MulticupTableInterface } from '../interfaces/multicup-table.interface';

@Injectable({
  providedIn: 'root',
})
export class CupTableService extends BackendService {
  public getOnlineCupFullTable$(id: string): Observable<MulticupTableInterface> {
    return this.post$<MulticupTableInterface>(URL_PARAMS.CUP.ONLINE_FULL_TABLE(id));
  }

  public getOnlineCupRoundTable$(id: string, round: string): Observable<MulticupRoundInterface> {
    return this.post$<MulticupRoundInterface>(URL_PARAMS.CUP.ONLINE_ROUND(id, round));
  }

  public getMultiCupFullTable$(id: string, physics: Physics): Observable<MulticupTableInterface> {
    return this.post$<MulticupTableInterface>(URL_PARAMS.CUP.MULTICUP_FULL_TABLE(id, physics));
  }

  public getMultiCupRoundTable$(id: string, physics: Physics, round: string): Observable<MulticupRoundInterface> {
    return this.post$<MulticupRoundInterface>(URL_PARAMS.CUP.MULTICUP_ROUND(id, physics, round));
  }
}
