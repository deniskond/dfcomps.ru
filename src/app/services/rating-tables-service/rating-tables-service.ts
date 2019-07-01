import { URL_PARAMS } from '../../configs/url-params.config';
import { Physics } from '../../enums/physics.enum';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RatingTablesService extends BackendService {
    public getTop10Table$(physics: Physics): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.TOP_TEN_TABLE(physics));
    }

    public getRatingTablePage(physics: Physics, page: number): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.RATING_TABLE_PAGE(physics, page));
    }

    public getRatingTablePlayersCount(physics: Physics): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.RATING_TABLE_PLAYERS_COUNT(physics));
    }

    public getSeasonRatingTablePage(physics: Physics, page: number, season: number): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.SEASON_RATING_TABLE_PAGE(physics, page, season));
    }

    public getSeasonRatingTablePlayersCount(physics: Physics, season: number): Observable<LeaderTableInterface[]> {
        return this.post$(URL_PARAMS.SEASON_RATING_TABLE_PLAYERS_COUNT(physics, season));
    }
}
