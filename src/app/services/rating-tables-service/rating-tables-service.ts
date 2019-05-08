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
        return this.get(URL_PARAMS.TOP_TEN_TABLE(physics));
    }
}
