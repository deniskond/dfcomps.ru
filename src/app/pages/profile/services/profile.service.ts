import { URL_PARAMS } from '../../../configs/url-params.config';
import { BackendService } from '../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProfileInterface } from '../interfaces/profile.interface';

@Injectable()
export class ProfileService extends BackendService {
    private profiles: Record<string, ProfileInterface> = {};

    public getProfile$(playerId: string): Observable<ProfileInterface> {
        return this.profiles[playerId]
            ? of(this.profiles[playerId])
            : this.post$(URL_PARAMS.PROFILE(playerId)).pipe(tap((profile: ProfileInterface) => (this.profiles[playerId] = profile)));
    }
}
