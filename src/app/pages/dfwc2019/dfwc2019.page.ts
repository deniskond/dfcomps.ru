import { LanguageService } from '../../services/language/language.service';
import { Translations } from '../../components/translations/translations.component';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DfwcResultInterface } from './interfaces/dfwc-result.interface';
import { MAX_DFWC_RATING, vq3Table, cpmTable } from './constants/results.constants';

@Component({
    templateUrl: './dfwc2019.page.html',
    styleUrls: ['./dfwc2019.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dfwc2019PageComponent extends Translations implements OnInit {
    public vq3TableWithChange: DfwcResultInterface[];
    public cpmTableWithChange: DfwcResultInterface[];

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.vq3TableWithChange = vq3Table.map((result: DfwcResultInterface) => ({
            ...result,
            change: Math.round((MAX_DFWC_RATING * result.points) / vq3Table[0].points),
        }));

        this.cpmTableWithChange = cpmTable.map((result: DfwcResultInterface) => ({
            ...result,
            change: Math.round((MAX_DFWC_RATING * result.points) / cpmTable[0].points),
        }));
    }
}
