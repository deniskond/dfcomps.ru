import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Languages, NewsInterfaceUnion } from '@dfcomps/contracts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COUNTRIES_CONFIG } from '~shared/configs/countries.config';
import { SmileInterface, SMILES_CONFIG } from '~shared/configs/smiles.config';
import { CountryInterface } from '~shared/interfaces/country.interface';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  selector: 'app-html-news',
  templateUrl: './html-news.component.html',
  styleUrls: ['./html-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlNewsComponent implements OnInit, OnDestroy {
  @Input() news: NewsInterfaceUnion;

  public newsHtml: SafeHtml;

  private onDestroy$ = new Subject<void>();

  constructor(
    private domSanitizer: DomSanitizer,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.languageService
      .getLanguage$()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((language: Languages) => {
        const newsHtml = language === Languages.RU ? this.news.text : this.news.textEn;

        this.newsHtml = this.domSanitizer.bypassSecurityTrustHtml(
          newsHtml ? this.getNewsWithSmilesAndFlags(newsHtml) : '',
        );
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private getNewsWithSmilesAndFlags(newsHtml: string): string {
    const splitMessage = newsHtml.split(/(\:\w+?\:)/gm).filter((messagePart: string) => !!messagePart.trim());
    const messageParts = splitMessage.map((messagePart: string) => {
      const smileHTML: string | null = this.getSmileHTML(messagePart);

      if (smileHTML) {
        return smileHTML;
      }

      const flagHTML: string | null = this.getFlagHTML(messagePart);

      if (flagHTML) {
        return flagHTML;
      }

      return messagePart;
    });

    return messageParts.join('');
  }

  private getSmileHTML(text: string): string | null {
    if (!text.match(/\:.*\:/gm)) {
      return null;
    }

    const strippedColonsText: string = text.substring(1, text.length - 1);
    const smile = SMILES_CONFIG.SMILES.find(({ name }: SmileInterface) => name === strippedColonsText);

    if (!smile) {
      return null;
    }

    return `<div class="smile" style="background-position-x: -${(smile.col - 1) * 32}px; background-position-y: -${
      (smile.row - 1) * 32
    }px;
    display: inline-block;
    vertical-align: middle;"></div>`;
  }

  private getFlagHTML(text: string): string | null {
    const flagMatch: RegExpMatchArray | null = text.match(/\:flag_(.*)\:/);

    if (!flagMatch) {
      return null;
    }

    const countryShortName = flagMatch[1];
    const country = COUNTRIES_CONFIG.COUNTRIES.find(
      ({ shortName }: CountryInterface) => shortName === countryShortName,
    );

    if (!country) {
      return null;
    }

    return `<div style="display:inline-block;vertical-align: middle;background-position: -${(country.col - 1) * COUNTRIES_CONFIG.SPRITE_COLUMN_WIDTH}px -${
      (country.row - 1) * COUNTRIES_CONFIG.SPRITE_ROW_HEIGHT
    }px" class="flag"></div>`;
  }
}
