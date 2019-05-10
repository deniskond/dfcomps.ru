import { Physics } from '../../../../enums/physics.enum';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-profile-rating-chart',
    templateUrl: './profile-rating-chart.component.html',
    styleUrls: ['./profile-rating-chart.component.less'],
})
export class ProfileRatingChartComponent {
    @Input()
    physics: Physics;
    @Input()
    chart: number[];
}
