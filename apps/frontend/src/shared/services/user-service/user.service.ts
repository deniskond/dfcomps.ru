import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserInterface } from '../../interfaces/user.interface';
import { LoginAvailableDtoInterface, LoginResponseDto } from '@dfcomps/contracts';

@Injectable()
export class UserService {
  private _currentUser$ = new BehaviorSubject<UserInterface | null>(null);

  constructor(private backendService: BackendService) {}

  public getCurrentUser$(): Observable<UserInterface | null> {
    return this._currentUser$.asObservable();
  }

  public loginByPassword$(login: string, password: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseDto>(URL_PARAMS.AUTH.GET_PASSWORD_TOKEN, {
        login,
        password,
      })
      .pipe(
        tap(({ user }: LoginResponseDto) => this.setCurrentUser(user)),
        map(() => true),
      );
  }

  public loginByDiscord$(discordAccessToken: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseDto>(URL_PARAMS.AUTH.GET_DISCORD_TOKEN, {
        discordAccessToken,
      })
      .pipe(
        tap(({ user }: LoginResponseDto) => this.setCurrentUser(user)),
        map(() => true),
      );
  }

  public checkLogin$(login: string): Observable<boolean> {
    return this.backendService
      .post$<LoginAvailableDtoInterface>(URL_PARAMS.AUTH.CHECK_LOGIN, {
        login,
      })
      .pipe(map(({ loginAvailable }: LoginAvailableDtoInterface) => loginAvailable));
  }

  public register$(login: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseDto>(URL_PARAMS.AUTH.REGISTER, {
        login,
      })
      .pipe(
        tap(({ user }: LoginResponseDto) => this.setCurrentUser(user)),
        map(() => true),
      );
  }

  public logout(): void {
    this._currentUser$.next(null);
  }

  private setCurrentUser(user: UserInterface): void {
    this._currentUser$.next(user);
  }
}
