import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  selector: 'app-overbounces-warning-dialog',
  templateUrl: './overbounces-warning-dialog.component.html',
  styleUrls: ['./overbounces-warning-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverbouncesWarningDialogComponent {
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  constructor(private languageService: LanguageService) {}
}
