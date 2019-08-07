import { COUNTRIES_CONFIG } from '../../configs/countries.config';
import { CountryInterface } from '../../interfaces/country.interface';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-flag',
    templateUrl: './flag.component.html',
    styleUrls: ['./flag.component.less'],
})
export class FlagComponent implements OnChanges {
    @Input()
    country: string;

    public flagStyle: Record<string, string>;

    ngOnChanges({ country }: SimpleChanges): void {
        this.flagStyle = this.getFlagStyle(this.country);
    }

    private getFlagStyle(countryShortName: string): Record<string, string> {
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
