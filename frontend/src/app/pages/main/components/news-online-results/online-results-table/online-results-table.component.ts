import { OnlineCupResultInterface } from '../../../../../interfaces/online-cup-result.interface';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Physics } from '../../../../../enums/physics.enum';
import { getTablePlaces } from '../../../../../helpers/table-places.helper';
import { range } from 'lodash';
import { Router } from '@angular/router';

@Component({
    selector: 'app-online-results-table',
    templateUrl: './online-results-table.component.html',
    styleUrls: ['./online-results-table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsOnlineResultsTableComponent implements OnInit {
    @Input() table: OnlineCupResultInterface[];
    @Input() cupId: string;
    @Input() physics: Physics;

    public places: number[];
    public range = range;
    public allPhysics = Physics;

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.places = getTablePlaces(this.table.map(({ finalSum }: OnlineCupResultInterface) => +finalSum));
    }

    public navigateToOnlineCupTable(): void {
        this.router.navigate(['/cup/online'], { queryParams: { id: this.cupId } });
    }
}
