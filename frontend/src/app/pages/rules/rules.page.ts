import { LanguageService } from './../../services/language/language.service';
import { Languages } from '../../enums/languages.enum';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    templateUrl: './rules.page.html',
    styleUrls: ['./rules.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesPageComponent {
    public language$: Observable<Languages> = this.languageService.getLanguage$();
    public languages = Languages;

    constructor(private languageService: LanguageService) {}
}
