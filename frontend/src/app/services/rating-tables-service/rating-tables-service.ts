import { URL_PARAMS } from '../../configs/url-params.config';
import { Physics } from '../../enums/physics.enum';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

const MAX_PLAYERS_PER_PAGE = 100;

@Injectable({
    providedIn: 'root',
})
export class RatingTablesService extends BackendService {
    private cachedTables: Record<string, LeaderTableInterface[]> = {};

    public getTop10Table$(physics: Physics): Observable<LeaderTableInterface[]> {
        if (this.cachedTables[physics]) {
            return of(this.cachedTables[physics]);
        }

        return this.post$(URL_PARAMS.TOP_TEN_TABLE(physics)).pipe(tap((table: LeaderTableInterface[]) => this.cachedTables[physics] = table));
    }

    public getRatingTablePage$(physics: Physics, page: number): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.RATING_TABLE_PAGE(physics, page));
    }

    public getRatingTablePagesCount$(): Observable<number> {
        return this.post$(URL_PARAMS.RATING_TABLE_PLAYERS_COUNT()).pipe(
            map((response: { count: string }) => +response.count),
            map((playersCount: number) => Math.ceil(playersCount / MAX_PLAYERS_PER_PAGE)),
        );
    }

    public getSeasonRatingTablePage$(
        physics: Physics,
        page: number,
        season: number,
    ): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.SEASON_RATING_TABLE_PAGE(physics, page, season));
    }

    public getSeasonRatingTablePagesCount$(season: number): Observable<number> {
        return this.post$(URL_PARAMS.SEASON_RATING_TABLE_PLAYERS_COUNT(season)).pipe(
            map((response: { count: string }) => +response.count),
            map((playersCount: number) => Math.ceil(playersCount / MAX_PLAYERS_PER_PAGE)),
        );
    }
}
