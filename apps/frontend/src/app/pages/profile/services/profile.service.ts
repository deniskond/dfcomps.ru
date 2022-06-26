import { BackendService, URL_PARAMS } from '@frontend/shared/rest-api';
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
      : this.post$<ProfileInterface>(URL_PARAMS.PROFILE(playerId)).pipe(
          tap((profile: ProfileInterface) => (this.profiles[playerId] = profile)),
        );
  }

  public getProfileNickCanBeChanged$(): Observable<boolean> {
    return this.post$<{ change_allowed: boolean }>(URL_PARAMS.PROFILE_CHECK_NICK_CHANGE()).pipe(
      map(({ change_allowed }) => change_allowed),
    );
  }

  public updateProfile$(nick: string, avatar: File | undefined, country: string): Observable<void> {
    return this.uploadFile$(URL_PARAMS.PROFILE_UPDATE(), [{ fileKey: 'file', file: avatar }], {
      nick,
      country,
    });
  }
}
