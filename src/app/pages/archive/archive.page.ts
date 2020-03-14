import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { Translations } from '../../components/translations/translations.component';
import { Component, OnInit } from '@angular/core';
import { ArchiveService } from './services/archive/archive.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { range } from 'lodash';
import { switchMap } from 'rxjs/operators';
import { ArchiveNewsInterface } from './interfaces/archive-news.interface';
import { Router } from '@angular/router';
import * as moment from 'moment';

const NEWS_ON_PAGE = 50;

@Component({
    templateUrl: './archive.page.html',
    styleUrls: ['./archive.page.less'],
})
export class ArchivePageComponent extends Translations implements OnInit {
    public newsCount: number;
    public pagesCount: number;
    public news$: Observable<ArchiveNewsInterface[]>;
    public currentNewsRange$ = new BehaviorSubject<[number, number]>([0, NEWS_ON_PAGE]);
    public currentPage = 0;
    public range = range;
    public language$: Observable<Languages>;
    public languages = Languages;

    constructor(
        private router: Router,
        private archiveService: ArchiveService,
        protected languageService: LanguageService,
    ) {
        super(languageService);
    }

    ngOnInit(): void {
        this.archiveService.getNewsCount$().subscribe((count: number) => {
            this.newsCount = count;
            this.pagesCount = Math.ceil(count / NEWS_ON_PAGE);
        });

        this.news$ = this.currentNewsRange$.pipe(
            switchMap(([startIndex, endIndex]: [number, number]) =>
                startIndex || endIndex ? this.archiveService.getArchiveNews$(startIndex, endIndex) : of([]),
            ),
        );

        this.language$ = this.languageService.getLanguage$();

        super.ngOnInit();
    }

    public navigateToNewsPage(newsId: number): void {
        this.router.navigate([`/news/${newsId}`]);
    }

    public changePagination(page: number): void {
        this.currentPage = page;
        this.currentNewsRange$.next([0, 0]);
        this.currentNewsRange$.next([page * NEWS_ON_PAGE, (page + 1) * NEWS_ON_PAGE]);
    }

    public formatDate(date: string): string {
        return moment(date).format('DD.MM.YYYY HH:mm');
    }
}
