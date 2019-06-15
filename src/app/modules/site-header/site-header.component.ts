import { NavigationPages } from '../../routing/enums/pages.enum';
import { TABS_CONFIG, TabInterface } from '../../routing/config/tabs.config';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-site-header',
    templateUrl: './site-header.component.html',
    styleUrls: ['./site-header.component.less'],
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
    public pages = NavigationPages;
    public tabs = TABS_CONFIG.TABS;
    public activePage: NavigationPages;

    private onDestroy$ = new Subject<void>();

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.setActivePage();
        this.setActivePageSubscription();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public navigate(page: NavigationPages): void {
        this.router.navigate([`/${page}`]);
    }

    private setActivePageSubscription(): void {
        this.router.events
            .pipe(
                filter((event: RouterEvent) => event instanceof NavigationEnd),
                takeUntil(this.onDestroy$),
            )
            .subscribe(() => this.setActivePage());
    }

    private setActivePage(): void {
        const activeTab: TabInterface = this.tabs.find(
            ({ page }: TabInterface) => page && this.router.url.indexOf(page) !== -1,
        );

        if (this.router.url === '/') {
            this.activePage = NavigationPages.MAIN;

            return;
        }

        if (activeTab) {
            this.activePage = activeTab.page;

            return;
        }

        this.activePage = null;
    }
}
