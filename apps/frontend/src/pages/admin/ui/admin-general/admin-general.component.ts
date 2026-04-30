import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, take } from 'rxjs';
import { AdminCupInterface } from '@dfcomps/contracts';
import { AdminDataService } from '../../business/admin-data.service';

@Component({
  selector: 'admin-general',
  templateUrl: './admin-general.component.html',
  styleUrls: ['./admin-general.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AdminGeneralComponent implements OnInit {
  public cups: AdminCupInterface[] = [];
  public selectedCupId: number | null = null;
  public isLoaded = false;

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin([this.adminDataService.getAllCups$(false), this.adminDataService.getTimerCup$()])
      .pipe(take(1))
      .subscribe(([cups, timerCup]) => {
        this.cups = cups;
        this.selectedCupId = timerCup.currentTimerCupId;
        this.isLoaded = true;
        this.changeDetectorRef.markForCheck();
      });
  }

  public onCupSelect(value: number): void {
    const cupId: number | null = value === 0 ? null : value;

    this.adminDataService
      .setTimerCup$(cupId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.selectedCupId = cupId;
          this.snackBar.open('Timer cup updated successfully', 'OK', { duration: 3000 });
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.snackBar.open('Failed to update timer cup', 'OK', { duration: 3000 });
        },
      });
  }
}
