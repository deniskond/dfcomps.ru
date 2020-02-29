import { URL_PARAMS } from '../../../configs/url-params.config';
import { BackendService } from '../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ProfileInterface } from '../interfaces/profile.interface';

@Injectable()
export class ProfileService extends BackendService {
    private profiles: Record<string, ProfileInterface> = {};

    public getProfile$(playerId: string, caching = true): Observable<ProfileInterface> {
        return this.profiles[playerId] && caching
            ? of(this.profiles[playerId])
            : this.post$(URL_PARAMS.PROFILE(playerId)).pipe(
                  tap((profile: ProfileInterface) => (this.profiles[playerId] = profile)),
              );
    }

    public getProfileNickCanBeChanged$(): Observable<boolean> {
        return this.post$(URL_PARAMS.PROFILE_CHECK_NICK_CHANGE()).pipe(map(({ change_allowed }) => change_allowed));
    }

    public updateProfile$(nick: string, avatar: File | undefined, country: string): Observable<void> {       
        return this.uploadFile$(URL_PARAMS.PROFILE_UPDATE(), avatar, {
            nick,
            country,
        });
    }
}
