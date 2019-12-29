import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { NewsOfflineResultsInterface } from '../../../../services/news-service/interfaces/news-offline-results.interface';
import { Component, Input, OnInit } from '@angular/core';
import { DfwcResultsService } from './services/dfwc-results.service';

@Component({
    selector: 'app-news-dfwc-results',
    templateUrl: './news-dfwc-results.component.html',
    styleUrls: ['./news-dfwc-results.component.less'],
})
export class NewsDfwcResultsComponent extends Translations implements OnInit {
    @Input()
    news: NewsOfflineResultsInterface;

    public mappedOfflineNews: NewsOfflineResultsInterface;

    constructor(protected languageService: LanguageService, private dfwcResultsService: DfwcResultsService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.mappedOfflineNews = this.dfwcResultsService.mapDfwcResultsToOfflineNews(this.news);
        super.ngOnInit();
    }
}
