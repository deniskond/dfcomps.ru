import { Languages } from '../../../enums/languages.enum';
import { LanguageService } from '../../../services/language/language.service';
import { Translations } from '../../../components/translations/translations.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-rating-system',
    templateUrl: './rating-system.component.html',
    styleUrls: ['./rating-system.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingSystemComponent extends Translations {
    public languages = Languages;

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }
}
