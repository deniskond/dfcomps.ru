import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { NewsTypes } from '../../../../enums/news-types.enum';
import { NewsService } from '../../../../services/news-service/news.service';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, EMPTY } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-single-news-page',
    templateUrl: './single-news-page.component.html',
    styleUrls: ['./single-news-page.component.less'],
})
export class SingleNewsPageComponent extends Translations implements OnInit, OnDestroy {
    public singleNews$: Observable<NewsInterfaceUnion>;
    public hasError = false;
    public newsTypes = NewsTypes;

    private onDestroy$ = new Subject<void>();

    constructor(private activatedRoute: ActivatedRoute, private newsService: NewsService, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.singleNews$ = this.activatedRoute.params.pipe(
            tap(() => (this.hasError = false)),
            switchMap(({ id }: Params) => this.newsService.getSingleNews$(id)),
            catchError(() => {
                this.hasError = true;

                return EMPTY;
            }),
            takeUntil(this.onDestroy$),
        );

        super.ngOnInit();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }

    public formatDate(date: string): string {
        return moment(date).format('DD.MM.YYYY HH:mm');
    }
}
