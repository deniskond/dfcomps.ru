import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ProfileCupInterface } from '../../interfaces/profile-cup.interface';

@Component({
    selector: 'app-profile-cups-table',
    templateUrl: './profile-cups-table.component.html',
    styleUrls: ['./profile-cups-table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCupsTableComponent extends Translations {
    @Input()
    cups: ProfileCupInterface[];

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }
}
