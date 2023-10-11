import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { URL_PARAMS } from '../business/url-params.config';
import { BackendService } from '../business/backend.service';
import { SeasonNumberInterface } from '@dfcomps/contracts';

@Injectable({
  providedIn: 'root',
})
export class CurrentSeasonService {
  constructor(protected backendService: BackendService) {}

  getCurrentSeason$(): Observable<number> {
    return this.backendService.get$<SeasonNumberInterface>(URL_PARAMS.SEASON.GET).pipe(map(({ season }) => season));
  }
}
