import { URL_PARAMS } from '../../../configs/url-params.config';
import { BackendService } from '../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ProfileService extends BackendService {
    private profiles: Record<string, any> = {};

    public getProfile$(playerId: string): Observable<any> {
        return this.profiles[playerId]
            ? of(this.profiles[playerId])
            : this.get(URL_PARAMS.PROFILE(playerId)).pipe(tap((profile: any) => (this.profiles[playerId] = profile)));
    }
}
