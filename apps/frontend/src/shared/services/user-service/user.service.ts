import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { LoginAvailableDtoInterface } from './dto/login-available.dto';
import { filter, map, tap } from 'rxjs/operators';
import { UserInterface } from '../../interfaces/user.interface';
import { LoginResultDtoInterface } from './dto/login-result.dto';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class UserService {
  private firstTimeLogin = true;
  private _currentUser$ = new BehaviorSubject<UserInterface | null>(null);

  constructor(private backendService: BackendService, private cookieService: CookieService) {}

  public getCurrentUser$(): Observable<UserInterface | null> {
    return this._currentUser$.asObservable().pipe(
      tap((currentUser: UserInterface | null) => {
        if (!currentUser) {
          this.tryLoginFromCookie();
        }
      }),
    );
  }

  public login$(login: string, password: string): Observable<LoginResultDtoInterface> {
    return this.backendService.post$(URL_PARAMS.USER_ACTIONS.LOGIN, {
      login,
      password,
    });
  }

  public checkLogin$(login: string): Observable<boolean> {
    return this.backendService
      .post$<LoginAvailableDtoInterface>(URL_PARAMS.USER_ACTIONS.CHECK_LOGIN, {
        login,
      })
      .pipe(map(({ loginAvailable }: LoginAvailableDtoInterface) => loginAvailable));
  }

  public register$(login: string, password: string, email: string): Observable<UserInterface> {
    return this.backendService.post$(URL_PARAMS.USER_ACTIONS.REGISTER, {
      login,
      password,
      email,
    });
  }

  public logout(): void {
    this.cookieService.delete('login');
    this.cookieService.delete('password');
    this._currentUser$.next(null);
  }

  public setCurrentUser(user: UserInterface): void {
    this._currentUser$.next(user);
  }

  private tryLoginFromCookie(): void {
    if (!this.firstTimeLogin) {
      return;
    }

    this.firstTimeLogin = false;

    const login = this.cookieService.get('login');
    const password = this.cookieService.get('password');

    if (login && password) {
      this.backendService
        .post$<LoginResultDtoInterface>(URL_PARAMS.USER_ACTIONS.LOGIN, {
          login,
          password,
        })
        .pipe(filter(({ logged }: LoginResultDtoInterface) => logged))
        .subscribe(({ user }: LoginResultDtoInterface) => this.setCurrentUser(user!));
    }
  }
}
