import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Languages } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  templateUrl: './sdfc.component.html',
  styleUrls: ['./sdfc.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SdfcComponent {
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  constructor(private languageService: LanguageService) {}
}
