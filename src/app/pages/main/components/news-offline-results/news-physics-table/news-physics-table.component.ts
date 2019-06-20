import { ValidDemoInterface } from '../../../../../interfaces/valid-demo.interface';
import { Component, Input, OnInit } from '@angular/core';
import { Physics } from '../../../../../enums/physics.enum';
import { getTablePlaces } from '../../../../../helpers/table-places.helper';
import { formatResultTime } from '../../../../../helpers/result-time.helper';
import { range } from 'lodash';

@Component({
    selector: 'app-news-physics-table',
    templateUrl: './news-physics-table.component.html',
    styleUrls: ['./news-physics-table.component.less'],
})
export class NewsPhysicsTableComponent implements OnInit {
    @Input() physics: Physics;
    @Input() physicsTable: ValidDemoInterface[];
    @Input() archiveLink: string;
    @Input() cupId: string;
    @Input() maxDemosCount: number;

    public places: number[];
    public range = range;

    ngOnInit(): void {
        this.places = getTablePlaces(this.physicsTable.map(({ time }: ValidDemoInterface) => +time));
    }

    public formatResult(time: string): string {
        return formatResultTime(time);
    }
}
