import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Physics } from '../../../../enums/physics.enum';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-profile-rating-chart',
    templateUrl: './profile-rating-chart.component.html',
    styleUrls: ['./profile-rating-chart.component.less'],
})
export class ProfileRatingChartComponent extends Translations implements OnInit {
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

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
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

        super.ngOnInit();
    }
}
