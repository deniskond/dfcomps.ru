import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationPages } from './routing/enums/pages.enum';
import { TABS_CONFIG } from './routing/config/tabs.config';
import * as moment from 'moment';
import { CupTypes } from './enums/cup-types.enum';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    public pages = NavigationPages;
    public activePage: NavigationPages;
    public tabs = TABS_CONFIG.TABS;

    public logged = true;
    public nick = 'Nosf';
    public isAdmin = true;
    public cupTypes = CupTypes;

    // TODO [DFRU-21] Оффлайн капы
    // TODO [DFRU-22] Онлайн капы
    public startTime = moment().add(10, 'seconds').unix();
    public endTime = moment().add(20, 'seconds').unix();

    constructor(private router: Router) {}

    public ngOnInit(): void {
        this.activePage = NavigationPages.MAIN;
    }

    public navigate(page: NavigationPages): void {
        this.router.navigate([`/${page}`]);
        this.activePage = page;
    }
}
