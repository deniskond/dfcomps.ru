import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MulticupRoundInterface } from '../interfaces/multicup-round.interface';
import { MulticupTableInterface } from '../interfaces/multicup-table.interface';
import { Physics } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class CupTableService extends BackendService {
  public getOnlineCupFullTable$(id: string): Observable<MulticupTableInterface> {
    return this.get$<MulticupTableInterface>(URL_PARAMS.TABLES.ONLINE_FULL_TABLE(id));
  }

  public getOnlineCupRoundTable$(id: string, round: string): Observable<MulticupRoundInterface> {
    return this.get$<MulticupRoundInterface>(URL_PARAMS.TABLES.ONLINE_ROUND(id, round));
  }

  public getMultiCupFullTable$(id: string, physics: Physics): Observable<MulticupTableInterface> {
    return this.get$<MulticupTableInterface>(URL_PARAMS.TABLES.MULTICUP_FULL_TABLE(id, physics));
  }

  public getMultiCupRoundTable$(id: string, physics: Physics, round: string): Observable<MulticupRoundInterface> {
    return this.get$<MulticupRoundInterface>(URL_PARAMS.TABLES.MULTICUP_ROUND(id, physics, round));
  }
}
