import { Physics } from '../../../../enums/physics.enum';
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-profile-rating-chart',
    templateUrl: './profile-rating-chart.component.html',
    styleUrls: ['./profile-rating-chart.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileRatingChartComponent implements OnChanges {
    @Input()
    physics: Physics;
    @Input()
    chart: string[];

    public barChartOptions: any = {
        scaleShowVerticalLines: true,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [
                {
                    display: false,
                },
            ],
        },
        tooltips: {
            displayColors: false,
        },
        legend: {
            display: false,
        },
    };

    public barChartLabels: string[];
    public barChartData: any;

    ngOnChanges({ chart }: SimpleChanges): void {
        if (chart) {
            this.barChartLabels = this.chart;
            this.barChartData = [
                {
                    data: this.chart.map(val => +val),
                    label: `${this.physics.toUpperCase()} Rating`,
                    fill: true,
                    borderColor: '#337ab7',
                    backgroundColor: '#eeeeee',
                    borderWidth: 1,
                    pointRadius: 3,
                    pointBackgroundColor: '#337ab7',
                    pointBorderWidth: 0,
                },
            ];
        }
    }
}
