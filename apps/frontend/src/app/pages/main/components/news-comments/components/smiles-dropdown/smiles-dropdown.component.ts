import { PersonalSmileInterface } from './../../../../../../services/smiles/personal-smile.interface';
import { UserInterface } from './../../../../../../interfaces/user.interface';
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SMILES_CONFIG, SmileInterface, SmileGroups } from '../../../../../../configs/smiles.config';
import { groupBy } from 'lodash';
import { LanguageService } from '../../../../../../services/language/language.service';
import { Observable, combineLatest } from 'rxjs';
import { Languages } from '../../../../../../enums/languages.enum';
import { map, startWith } from 'rxjs/operators';
import { ENGLISH_TRANSLATIONS } from '../../../../../../translations/en.translations';
import { RUSSIAN_TRANSLATIONS } from '../../../../../../translations/ru.translations';
import { FormGroup, FormControl } from '@angular/forms';

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
export class SmilesDropdownComponent implements OnInit {
  @Input() currentUser: UserInterface | null;
  @Input() personalSmiles: PersonalSmileInterface[];

  @Output() chooseSmile = new EventEmitter<SmileInterface>();

  public sortedAndGroupedSmiles$: Observable<SortedSmileGroupsInterface[]>;
  public hoveredSmile: SmileInterface | null = null;
  public smileSearchForm = new FormGroup({ smile: new FormControl('') });
  public searchSmilesCaption$: Observable<string> = this.languageService.getTranslation$('searchSmiles');

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.initSmilesObservable();
  }

  public setFocusedSmile(smile: SmileInterface | null): void {
    this.hoveredSmile = smile;
  }

  public clearInput(): void {
    this.smileSearchForm.setValue({ smile: '' });
  }

  private initSmilesObservable(): void {
    this.sortedAndGroupedSmiles$ = combineLatest([
      this.languageService.getLanguage$(),
      this.smileSearchForm.get('smile')!.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([language, searchInput]: [Languages, string]) => this.getSortedAndGroupedSmiles(language, searchInput)),
    );
  }

  private getSortedAndGroupedSmiles(language: Languages, searchInput: string): SortedSmileGroupsInterface[] {
    const smilesFilteredBySearch: SmileInterface[] = SMILES_CONFIG.SMILES.filter(({ name }: SmileInterface) =>
      name.includes(searchInput),
    );
    const smilesFilteredByPersonal: SmileInterface[] = this.filterPersonalSmiles(smilesFilteredBySearch);

    return Object.entries(groupBy(smilesFilteredByPersonal, 'group'))
      .map(
        ([smileGroup, smiles]: [string, SmileInterface[]]) =>
          [smileGroup, smiles] as unknown as [SmileGroups, SmileInterface[]],
      )
      .sort(
        ([smileGroup1], [smileGroup2]) =>
          SMILES_CONFIG.SMILES_GROUP_INFO[smileGroup1].order - SMILES_CONFIG.SMILES_GROUP_INFO[smileGroup2].order,
      )
      .map(([smileGroup, smiles]: [SmileGroups, SmileInterface[]]) => ({
        name: this.getSmileGroupHeader(SMILES_CONFIG.SMILES_GROUP_INFO[smileGroup].name, language),
        items: smiles,
      }));
  }

  private getSmileGroupHeader(translation: string, language: Languages): string {
    return language === Languages.EN ? ENGLISH_TRANSLATIONS[translation] : RUSSIAN_TRANSLATIONS[translation];
  }

  private filterPersonalSmiles(smiles: SmileInterface[]): SmileInterface[] {
    const personal = smiles.filter(({ group }: SmileInterface) => group === SmileGroups.PERSONAL);
    const nonPersonal = smiles.filter(({ group }: SmileInterface) => group !== SmileGroups.PERSONAL);

    const filteredPersonalSmiles = this.currentUser
      ? personal.filter(({ name }: SmileInterface) =>
          this.personalSmiles.find(
            ({ playerId, smileAlias }: PersonalSmileInterface) =>
              playerId === this.currentUser!.id && smileAlias === name,
          ),
        )
      : [];

    return [...filteredPersonalSmiles, ...nonPersonal];
  }
}
