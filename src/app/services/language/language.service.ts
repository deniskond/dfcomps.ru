import { Languages } from '../../enums/languages.enum';
import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

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
        this.setLanguage(this.getLanguageFromCookie() as Languages || Languages.RU);
    }

    private getLanguageFromCookie(): unknown {
        return this.cookieService.get('language');
    }
}
