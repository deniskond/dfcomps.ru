import { Injectable } from '@angular/core';
import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { UserInterface } from '../../interfaces/user.interface';
import { AuthService } from '../auth/auth.service';
import { DiscordPromptInterface, LoginAvailableInterface, LoginResponseInterface } from '@dfcomps/auth';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class UserService {
  private currentUser$ = new BehaviorSubject<UserInterface | null>(null);

  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}

  public getCurrentUser$(): Observable<UserInterface | null> {
    return this.currentUser$.asObservable();
  }

  public loginByPassword$(login: string, password: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseInterface>(URL_PARAMS.AUTH.GET_PASSWORD_TOKEN, {
        login,
        password,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseInterface) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  public loginByDiscord$(discordAccessToken: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseInterface>(URL_PARAMS.AUTH.GET_DISCORD_TOKEN, {
        discordAccessToken,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseInterface) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  public checkLogin$(login: string): Observable<boolean> {
    return this.backendService
      .post$<LoginAvailableInterface>(URL_PARAMS.AUTH.CHECK_LOGIN, {
        login,
      })
      .pipe(map(({ loginAvailable }: LoginAvailableInterface) => loginAvailable));
  }

  public register$(login: string, discordAccessToken: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseInterface>(URL_PARAMS.AUTH.REGISTER, {
        login,
        discordAccessToken,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseInterface) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  public tryLoginFromCookie(): void {
    const login = this.cookieService.get('login');
    const password = this.cookieService.get('password');

    if (login && password) {
      this.getCurrentUser$()
        .pipe(
          take(1),
          tap(() => {
            this.cookieService.delete('login');
            this.cookieService.delete('password');
          }),
          filter((user) => !user),
          switchMap(() => this.loginByPassword$(login, password)),
        )
        .subscribe();
    }
  }

  public logout(): void {
    this.currentUser$.next(null);
    this.authService.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  public restoreAuthInfo(): void {
    try {
      const user: string | null = localStorage.getItem('user');
      const token: string | null = localStorage.getItem('token');

      if (user && token) {
        this.currentUser$.next(JSON.parse(user));
        this.authService.setToken(JSON.parse(token));
      }
    } catch (e) {}
  }

  public checkDiscordPrompt$(): Observable<boolean> {
    return this.backendService
      .get$<DiscordPromptInterface>(URL_PARAMS.AUTH.LAST_DISCORD_PROMPT)
      .pipe(map(({ prompt }: DiscordPromptInterface) => prompt));
  }

  public linkDiscord$(discordAccessToken: string): Observable<boolean> {
    return this.backendService
      .post$<LoginResponseInterface>(URL_PARAMS.AUTH.LINK_DISCORD, {
        discordAccessToken,
      })
      .pipe(
        tap((loginResponseDto: LoginResponseInterface) => this.setAuthInfo(loginResponseDto)),
        map(() => true),
      );
  }

  private setAuthInfo({ user, token }: LoginResponseInterface) {
    this.currentUser$.next(user);
    this.authService.setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', JSON.stringify(token));
  }
}
