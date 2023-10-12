import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { NickChangeResponseInterface, ProfileInterface } from '@dfcomps/contracts';

@Injectable()
export class ProfileService extends BackendService {
  private profiles: Record<string, ProfileInterface> = {};

  public getProfile$(playerId: number, caching = true): Observable<ProfileInterface> {
    return this.profiles[playerId] && caching
      ? of(this.profiles[playerId])
      : this.get$<ProfileInterface>(URL_PARAMS.PROFILE.GET_PROFILE(playerId)).pipe(
          tap((profile: ProfileInterface) => (this.profiles[playerId] = profile)),
        );
  }

  public getProfileNickCanBeChanged$(): Observable<boolean> {
    return this.get$<NickChangeResponseInterface>(URL_PARAMS.PROFILE.CHECK_NICK_CHANGE).pipe(
      map(({ change_allowed }) => change_allowed),
    );
  }

  public updateProfile$(nick: string, avatar: File | undefined, country: string): Observable<void[]> {
    const updateProfileQueries$: Observable<void>[] = [
      this.post$(URL_PARAMS.PROFILE.UPDATE_INFO, {
        nick,
        country,
      }),
    ];

    if (avatar) {
      updateProfileQueries$.push(
        this.uploadFile$(URL_PARAMS.PROFILE.UPDATE_AVATAR, [{ fileKey: 'file', file: avatar }]),
      );
    }

    return combineLatest(updateProfileQueries$);
  }
}
