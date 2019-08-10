import { MAIN_URL } from '../../configs/url-params.config';
import { Translations } from '../../components/translations/translations.component';
import { LanguageService } from '../../services/language/language.service';
import { Languages } from '../../enums/languages.enum';
import { NavigationPages } from '../../routing/enums/pages.enum';
import { TABS_CONFIG, TabInterface } from '../../routing/config/tabs.config';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { DownloadDfDialogComponent } from './components/download-df-dialog/download-df-dialog.component';

@Component({
    selector: 'app-site-header',
    templateUrl: './site-header.component.html',
    styleUrls: ['./site-header.component.less'],
})
export class SiteHeaderComponent extends Translations implements OnInit, OnDestroy {
    @ViewChild('downloadLink') downloadLink: ElementRef;

    public pages = NavigationPages;
    public tabs = TABS_CONFIG.TABS;
    public languages = Languages;
    public activePage: NavigationPages;
    public translations: Record<string, string>;
    public mainUrl = MAIN_URL;

    private onDestroy$ = new Subject<void>();

    constructor(private dialog: MatDialog, private router: Router, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.setActivePage();
        this.initActivePageSubscription();
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }

    public navigate(page: NavigationPages): void {
        this.router.navigate([`/${page}`]);
    }

    public onDownloadDefragClick(): void {
        this.downloadLink.nativeElement.click();
        this.dialog.open(DownloadDfDialogComponent);
    }

    private initActivePageSubscription(): void {
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
