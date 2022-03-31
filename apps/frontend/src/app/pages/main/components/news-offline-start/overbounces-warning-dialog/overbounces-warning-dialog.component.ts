import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Languages } from '../../../../../enums/languages.enum';
import { LanguageService } from '../../../../../services/language/language.service';

@Component({
  selector: 'app-overbounces-warning-dialog',
  templateUrl: './overbounces-warning-dialog.component.html',
  styleUrls: ['./overbounces-warning-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverbouncesWarningDialogComponent implements OnInit {
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {}
}
