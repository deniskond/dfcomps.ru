import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { NewsOnlineAnnounceInterface } from '../../../../services/news-service/interfaces/news-online-announce.interface';
import { Component, Input } from '@angular/core';
import { range } from 'lodash';

@Component({
    selector: 'app-news-online-announce',
    templateUrl: './news-online-announce.component.html',
    styleUrls: ['./news-online-announce.component.less'],
})
export class NewsOnlineAnnounceComponent extends Translations {
    @Input() news: NewsOnlineAnnounceInterface;

    public range = range;
    public columnCount = 4;
    public rowCount = 10;

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }
}
