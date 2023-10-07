import { COUNTRIES_CONFIG } from '../../configs/countries.config';
import { CountryInterface } from '../../interfaces/country.interface';
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-flag',
  templateUrl: './flag.component.html',
  styleUrls: ['./flag.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagComponent implements OnChanges {
  @Input()
  country: string | null;

  public flagStyle: Record<string, string>;

  ngOnChanges(): void {
    this.flagStyle = this.getFlagStyle(this.country);
  }

  private getFlagStyle(countryShortName: string | null): Record<string, string> {
    const country = COUNTRIES_CONFIG.COUNTRIES.find(
      ({ shortName }: CountryInterface) => shortName === countryShortName,
    );

    if (!country) {
      return { backgroundPosition: '-180px -182px' };
    }

    return {
      backgroundPosition: `-${(country.col - 1) * COUNTRIES_CONFIG.SPRITE_COLUMN_WIDTH}px 
                                 -${(country.row - 1) * COUNTRIES_CONFIG.SPRITE_ROW_HEIGHT}px`,
    };
  }
}
