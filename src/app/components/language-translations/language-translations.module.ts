import { LanguageService } from '../../services/language/language.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageTranslationsComponent } from './language-translations.component';

@NgModule({
    declarations: [LanguageTranslationsComponent],
    imports: [CommonModule],
    providers: [LanguageService],
})
export class LanguageTranslationsModule {}
