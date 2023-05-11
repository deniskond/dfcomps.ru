import { Languages } from '../../enums/languages.enum';
import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../modules/cup-timer/helpers/cup-time-format.helpers';
import { ENGLISH_TRANSLATIONS } from '../../translations/en.translations';
import { RUSSIAN_TRANSLATIONS } from '../../translations/ru.translations';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private language$ = new ReplaySubject<Languages>(1);

  constructor(private cookieService: CookieService) {}

  public getLanguage$(): Observable<Languages> {
    return this.language$.asObservable();
  }

  public setLanguage(language: Languages): void {
    this.cookieService.set('language', language);
    this.language$.next(language);
  }

  public setLanguageFromCookie(): void {
    this.setLanguage((this.getLanguageFromCookie() as Languages) || Languages.RU);
  }

  public getFormattedCupTime$(dateTime: string): Observable<string> {
    return this.getLanguage$().pipe(map((language: Languages) => formatCupTime(dateTime, language)));
  }

  public getTranslations$(): Observable<Record<string, string>> {
    return this.getLanguage$().pipe(
      map((language: Languages) => (language === Languages.EN ? ENGLISH_TRANSLATIONS : RUSSIAN_TRANSLATIONS)),
    );
  }

  public getTranslation$(translation: string): Observable<string> {
    return this.getTranslations$().pipe(map((translations: Record<string, string>) => translations[translation]));
  }

  private getLanguageFromCookie(): unknown {
    return this.cookieService.get('language');
  }
}
