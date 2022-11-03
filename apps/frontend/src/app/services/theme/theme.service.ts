import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, throttleTime } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Themes } from '@frontend/app/enums/themes.enum';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme$ = new ReplaySubject<Themes>(1);

  constructor(private cookieService: CookieService) {}

  public getTheme$(): Observable<Themes> {
    return this.theme$.asObservable();
  }

  public setTheme(theme: Themes): void {
    this.cookieService.set('theme', theme);
    this.theme$.next(theme);
  }

  public setThemeFromCookie(): void {
    this.setTheme((this.getThemeFromCookie() as Themes) || Themes.LIGHT);
  }

  private getThemeFromCookie(): unknown {
    return this.cookieService.get('theme');
  }
}
