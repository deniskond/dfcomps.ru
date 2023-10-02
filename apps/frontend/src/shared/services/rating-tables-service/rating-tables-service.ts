import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LeaderTableInterface, Physics, RatingTablesModes } from '@dfcomps/contracts';

const MAX_PLAYERS_PER_PAGE = 100;

@Injectable({
  providedIn: 'root',
})
export class RatingTablesService extends BackendService {
  private cachedTables: Record<string, LeaderTableInterface[]> = {};

  public getTop10Table$(physics: Physics, mode: RatingTablesModes): Observable<LeaderTableInterface[]> {
    if (this.cachedTables[`${physics}${mode}`]) {
      return of(this.cachedTables[`${physics}${mode}`]);
    }

    return this.get$<LeaderTableInterface[]>(URL_PARAMS.TOP_TEN_TABLE(), { physics, mode }).pipe(
      tap((table: LeaderTableInterface[]) => (this.cachedTables[`${physics}${mode}`] = table)),
    );
  }

  public getRatingTablePage$(physics: Physics, page: number): Observable<LeaderTableInterface[]> {
    return this.post$(URL_PARAMS.RATING_TABLE_PAGE(physics, page));
  }

  public getRatingTablePagesCount$(): Observable<number> {
    return this.post$<{ count: string }>(URL_PARAMS.RATING_TABLE_PLAYERS_COUNT()).pipe(
      map((response: { count: string }) => +response.count),
      map((playersCount: number) => Math.ceil(playersCount / MAX_PLAYERS_PER_PAGE)),
    );
  }

  public getSeasonRatingTablePage$(physics: Physics, page: number, season: number): Observable<LeaderTableInterface[]> {
    return this.post$(URL_PARAMS.SEASON_RATING_TABLE_PAGE(physics, page, season));
  }

  public getSeasonRatingTablePagesCount$(season: number): Observable<number> {
    return this.post$<{ count: string }>(URL_PARAMS.SEASON_RATING_TABLE_PLAYERS_COUNT(season)).pipe(
      map((response: { count: string }) => +response.count),
      map((playersCount: number) => Math.ceil(playersCount / MAX_PLAYERS_PER_PAGE)),
    );
  }
}
