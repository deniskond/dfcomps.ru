import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-profile-last-demos',
    templateUrl: './profile-last-demos.component.html',
    styleUrls: ['./profile-last-demos.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLastDemosComponent extends Translations {
    @Input()
    demos: string[];

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }
}
