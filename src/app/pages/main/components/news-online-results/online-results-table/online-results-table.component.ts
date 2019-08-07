import { LanguageService } from '../../../../../services/language/language.service';
import { Translations } from '../../../../../components/translations/translations.component';
import { OnlineCupResultInterface } from '../../../../../interfaces/online-cup-result.interface';
import { Component, Input, OnInit } from '@angular/core';
import { Physics } from '../../../../../enums/physics.enum';
import { getTablePlaces } from '../../../../../helpers/table-places.helper';
import { formatResultTime } from '../../../../../helpers/result-time.helper';
import { range } from 'lodash';

@Component({
    selector: 'app-online-results-table',
    templateUrl: './online-results-table.component.html',
    styleUrls: ['./online-results-table.component.less'],
})
export class NewsOnlineResultsTableComponent extends Translations implements OnInit {
    @Input() table: OnlineCupResultInterface[];
    @Input() cupId: string;
    @Input() physics: Physics;

    public places: number[];
    public range = range;
    public allPhysics = Physics;

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.places = getTablePlaces(this.table.map(({ finalSum }: OnlineCupResultInterface) => +finalSum));
        super.ngOnInit();
    }

    public formatResult(time: string): string {
        return formatResultTime(time);
    }
}
