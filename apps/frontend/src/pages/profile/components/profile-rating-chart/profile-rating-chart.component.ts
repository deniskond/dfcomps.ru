import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Physics } from '@dfcomps/contracts';
import { ChartConfiguration } from 'chart.js';
import { combineLatest, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { Themes } from '~shared/enums/themes.enum';
import { ThemeService } from '~shared/services/theme/theme.service';

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
  chart: number[];

  private onDestroy$ = new Subject<void>();
  private chart$ = new ReplaySubject<any>(1);

  constructor(
    private themeService: ThemeService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    combineLatest([this.themeService.getTheme$(), this.chart$])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([theme]: [Themes, any]) => {
        this.barChartLabels = this.chart;
        this.barChartData = {
          labels: this.barChartLabels,
          datasets: [
            {
              data: this.chart.map((val) => +val),
              fill: false,
              borderColor: theme === Themes.DARK ? 'rgb(105, 166, 213)' : '#337ab7',
              backgroundColor: theme === Themes.DARK ? '#333' : '#eee',
              tension: 0.4,
              borderWidth: 1,
            },
          ],
        };
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
      x: {
        offset: true,
        ticks: {
          display: false,
        },
      },
    },
    tooltips: {
      displayColors: false,
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  public barChartLabels: number[];
  public barChartData: ChartConfiguration<'line'>['data'];

  ngOnChanges({ chart }: SimpleChanges): void {
    if (chart) {
      this.chart$.next(chart);
    }
  }
}
