import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  templateUrl: './dsi.component.html',
  styleUrls: ['./dsi.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DSIComponent {
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  constructor(private languageService: LanguageService) {}
}
