import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Languages } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';

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
