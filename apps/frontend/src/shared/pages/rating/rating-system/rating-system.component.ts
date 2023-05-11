import { LanguageService } from '../../../services/language/language.service';
import { Languages } from '../../../enums/languages.enum';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rating-system',
  templateUrl: './rating-system.component.html',
  styleUrls: ['./rating-system.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingSystemComponent {
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  constructor(private languageService: LanguageService) {}
}
