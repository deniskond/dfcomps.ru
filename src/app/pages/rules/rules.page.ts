import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { Translations } from '../../components/translations/translations.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    templateUrl: './rules.page.html',
    styleUrls: ['./rules.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesPageComponent extends Translations {
    public languages = Languages;

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }
}
