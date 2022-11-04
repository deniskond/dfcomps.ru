import { Physics } from '../../../../enums/physics.enum';
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '@frontend/app/services/theme/theme.service';
import { combineLatest, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { Themes } from '@frontend/app/enums/themes.enum';

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

  private onDestroy$ = new Subject<void>();
  private chart$ = new ReplaySubject<any>(1);

  constructor(private themeService: ThemeService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    combineLatest([this.themeService.getTheme$(), this.chart$])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([theme]: [Themes, any]) => {
        this.barChartLabels = this.chart;
        this.barChartData = [
          {
            data: this.chart.map((val) => +val),
            label: `${this.physics.toUpperCase()} Rating`,
            fill: true,
            borderColor: theme === Themes.DARK ? 'rgb(105, 166, 213)' : '#337ab7',
            backgroundColor: theme === Themes.DARK ? '#333' : '#eee',
            borderWidth: 1,
            pointRadius: 3,
            pointBackgroundColor: 'var(--base-link-blue-color)',
            pointBorderWidth: 0,
          },
        ];
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

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
      this.chart$.next(chart);
    }
  }
}
