import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { URL_PARAMS } from '../../configs/url-params.config';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { LoginAvailableDtoInterface } from './dto/login-available.dto';
import { map } from 'rxjs/operators';
import { UserInterface } from '../../interfaces/user.interface';
import { LoginResultDtoInterface } from './dto/login-result.dto';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class UserService {
    private _currentUser$ = new BehaviorSubject<UserInterface>(null);

    constructor(private backendService: BackendService, private cookieService: CookieService) {}

    public getCurrentUser$(): Observable<UserInterface> {
        return this._currentUser$.asObservable();
    }

    public login$(login: string, password: string): Observable<LoginResultDtoInterface> {
        return this.backendService.post$(URL_PARAMS.USER_ACTIONS.LOGIN, {
            login,
            password,
        });
    }

    public tryLoginFromCookie$(): Observable<LoginResultDtoInterface> {
        const login = this.cookieService.get('login');
        const password = this.cookieService.get('password');

        return login && password
            ? this.backendService.post$(URL_PARAMS.USER_ACTIONS.LOGIN, {
                  login,
                  password,
              })
            : of({
                  logged: false,
                  user: null,
              });
    }

    public checkLogin$(login: string): Observable<boolean> {
        return this.backendService
            .post$(URL_PARAMS.USER_ACTIONS.CHECK_LOGIN, {
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
}
