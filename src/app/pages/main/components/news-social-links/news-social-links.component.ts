import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Translations } from '../../../../components/translations/translations.component';
import { LanguageService } from '../../../../services/language/language.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Languages } from '../../../../enums/languages.enum';

@Component({
    selector: 'app-news-social-links',
    templateUrl: './news-social-links.component.html',
    styleUrls: ['./news-social-links.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSocialLinksComponent extends Translations implements OnInit, OnDestroy {
    @Input() news: NewsInterfaceUnion;

    public language: Languages;
    public languages = Languages;
    private onDestroy$ = new Subject<void>();

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.languageService
            .getLanguage$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((language: Languages) => (this.language = language));
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }
}
