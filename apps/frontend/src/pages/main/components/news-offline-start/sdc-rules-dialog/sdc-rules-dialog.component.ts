import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Languages } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  selector: 'sdc-rules-dialog',
  templateUrl: './sdc-rules-dialog.component.html',
  styleUrls: ['./sdc-rules-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SDCRulesDialogComponent {
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  constructor(private languageService: LanguageService) {}
}
