import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { DARK_THEME_VARS } from './dark-theme.constants';
import { LIGHT_THEME_VARS } from './light-theme.constants';
import { Themes } from '~shared/enums/themes.enum';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme$ = new ReplaySubject<Themes>(1);
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  public getTheme$(): Observable<Themes> {
    return this.theme$.asObservable();
  }

  public setTheme(theme: Themes): void {
    localStorage.setItem('theme', theme);
    this.theme$.next(theme);

    this.renderer.setProperty(document.body, 'style', this.getThemeStyles(theme));
    (document.getElementsByTagName('html')[0] as HTMLElement).style.colorScheme = theme;
  }

  public setThemeFromCookie(): void {
    this.setTheme((this.getThemeFromCookie() as Themes) || Themes.LIGHT);
  }

  private getThemeFromCookie(): Themes {
    return localStorage.getItem('theme') as Themes;
  }

  private getThemeStyles(theme: Themes): string {
    const themeVars = theme === Themes.DARK ? DARK_THEME_VARS : LIGHT_THEME_VARS;

    return Object.entries(themeVars)
      .map(([key, value]: [string, string]) => `${key}: ${value}`)
      .join(';');
  }
}
