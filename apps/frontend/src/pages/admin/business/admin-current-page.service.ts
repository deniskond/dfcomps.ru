import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, ReplaySubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminCurrentPageService {
  private routeSubscription: Subscription;
  private _currentPage$ = new ReplaySubject<string>(1);
  private navigationPageMap: Record<string, string> = {
    cups: 'cups',
    validate: 'cups',
    news: 'news',
    season: 'season',
    multicups: 'multicups',
  };
  private currentPageMap: Record<string, string> = {
    cups: 'cups',
    validate: 'validate demos',
    news: 'news',
    season: 'season',
    multicups: 'multicups',
  };

  constructor(private router: Router) {}

  public setRouteSubscription(): void {
    this.setCurrentPageFromUrl(this.router.url);

    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.setCurrentPageFromUrl((event as NavigationEnd).url));
  }

  public setCurrentPage(page: string): void {
    this._currentPage$.next(page);
  }

  public get navigationPage$(): Observable<string> {
    return this._currentPage$.asObservable().pipe(map((page: string) => this.navigationPageMap[page]));
  }

  public get currentPage$(): Observable<string> {
    return this._currentPage$.asObservable().pipe(map((page: string) => this.currentPageMap[page]));
  }

  public unsetRouteSubscription(): void {
    this.routeSubscription.unsubscribe();
  }

  private setCurrentPageFromUrl(url: string): void {
    const splittedUrl: string[] = url.split('/');
    const urlPagePart = splittedUrl[2];

    this._currentPage$.next(urlPagePart || 'news');
  }
}
