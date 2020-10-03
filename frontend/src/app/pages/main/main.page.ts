import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { NewsInterfaceUnion } from '../../types/news-union.type';
import { NewsService } from '../../services/news-service/news.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsTypes } from '../../enums/news-types.enum';
import * as moment from 'moment';
import { distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isEqual } from 'lodash';

@Component({
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
    public news$: Observable<NewsInterfaceUnion[]>;
    public language$: Observable<Languages>;
    public newsTypes = NewsTypes;
    public languages = Languages;

    constructor(private router: Router, private newsService: NewsService, private languageService: LanguageService) {}

    ngOnInit(): void {
        this.newsService.loadMainPageNews();
        this.initObservables();
    }

    public formatDate(date: string): string {
        return moment(date).format('DD.MM.YYYY HH:mm');
    }

    public reloadNews(): void {
        this.newsService.loadMainPageNews();
    }

    public navigateToArchive(): void {
        this.router.navigate(['/archive']);
    }

    private initObservables(): void {
        this.news$ = this.newsService.getMainPageNews$().pipe(distinctUntilChanged(isEqual));
        this.language$ = this.languageService.getLanguage$();
    }
}
