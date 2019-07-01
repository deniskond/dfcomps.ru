import { URL_PARAMS } from '../../configs/url-params.config';
import { Physics } from '../../enums/physics.enum';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const MAX_PLAYERS_PER_PAGE = 100;

@Injectable({
    providedIn: 'root',
})
export class RatingTablesService extends BackendService {
    public getTop10Table$(physics: Physics): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.TOP_TEN_TABLE(physics));
    }

    public getRatingTablePage$(physics: Physics, page: number): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.RATING_TABLE_PAGE(physics, page));
    }

    public getRatingTablePagesCount$(): Observable<number> {
        return this.post$(URL_PARAMS.RATING_TABLE_PLAYERS_COUNT()).pipe(
            map((response: { count: string }) => +response.count),
            map((playersCount: number) => Math.floor(playersCount / MAX_PLAYERS_PER_PAGE)),
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
            map((playersCount: number) => Math.floor(playersCount / MAX_PLAYERS_PER_PAGE)),
        );
    }
}
