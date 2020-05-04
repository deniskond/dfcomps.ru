import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { SMILES_CONFIG, SmileInterface } from '../../../../../../configs/smiles.config';
import { groupBy } from 'lodash';
import { Translations } from '../../../../../../components/translations/translations.component';
import { LanguageService } from '../../../../../../services/language/language.service';
import { Observable } from 'rxjs';
import { Languages } from '../../../../../../enums/languages.enum';
import { map } from 'rxjs/operators';
import { ENGLISH_TRANSLATIONS } from '../../../../../../translations/en.translations';
import { RUSSIAN_TRANSLATIONS } from '../../../../../../translations/ru.translations';

interface SortedSmileGroupsInterface {
    name: string;
    items: SmileInterface[];
}

@Component({
    selector: 'app-smiles-dropdown',
    templateUrl: './smiles-dropdown.component.html',
    styleUrls: ['./smiles-dropdown.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmilesDropdownComponent extends Translations implements OnInit {
    @Output() chooseSmile = new EventEmitter<SmileInterface>();

    public sortedAndGroupedSmiles$: Observable<SortedSmileGroupsInterface[]>;
    public hoveredSmile: SmileInterface | null = null;

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.initSmilesObservable();
    }

    public getSmileStyle({ col, row }: SmileInterface): Record<string, string> {
        return {
            background: `url('/assets/images/smiles/smiles.png')`,
            'background-position-x': `-${(col - 1) * 32}px`,
            'background-position-y': `-${(row - 1) * 32}px`,
        };
    }

    public setFocusedSmile(smile: SmileInterface | null): void {
        this.hoveredSmile = smile;
    }

    private initSmilesObservable(): void {
        this.sortedAndGroupedSmiles$ = this.languageService.getLanguage$().pipe(map((language: Languages) => this.getSortedAndGroupedSmiles(language)));
    }

    private getSortedAndGroupedSmiles(language: Languages): SortedSmileGroupsInterface[] {
        return Object.entries(groupBy(SMILES_CONFIG.SMILES, 'group'))
            .sort(([smileGroup1], [smileGroup2]) => SMILES_CONFIG.SMILES_GROUP_INFO[smileGroup1].order - SMILES_CONFIG.SMILES_GROUP_INFO[smileGroup2].order)
            .map(([smileGroup, smiles]: [string, SmileInterface[]]) => ({
                name: this.getSmileGroupHeader(SMILES_CONFIG.SMILES_GROUP_INFO[smileGroup].name, language),
                items: smiles,
            }));
    }

    private getSmileGroupHeader(translation: string, language: Languages): string {
        return language === Languages.EN ? ENGLISH_TRANSLATIONS[translation] : RUSSIAN_TRANSLATIONS[translation];
    }
}
