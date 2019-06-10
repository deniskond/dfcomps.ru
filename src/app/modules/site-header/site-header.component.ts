import { NavigationPages } from '../../routing/enums/pages.enum';
import { TABS_CONFIG } from '../../routing/config/tabs.config';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-site-header',
    templateUrl: './site-header.component.html',
    styleUrls: ['./site-header.component.less'],
})
export class SiteHeaderComponent implements OnInit {
    public pages = NavigationPages;
    public tabs = TABS_CONFIG.TABS;
    public activePage: NavigationPages;

    constructor(private router: Router) {}

    public ngOnInit(): void {
        this.activePage = NavigationPages.MAIN;
    }

    public navigate(page: NavigationPages): void {
        this.router.navigate([`/${page}`]);
        this.activePage = page;
    }
}
