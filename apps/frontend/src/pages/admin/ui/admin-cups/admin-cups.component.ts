import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReplaySubject, switchMap } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminCupInterface } from '@dfcomps/contracts';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'admin-cups',
  templateUrl: './admin-cups.component.html',
  styleUrls: ['./admin-cups.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCupsComponent implements OnInit {
  public cups: AdminCupInterface[];
  public cups$ = new ReplaySubject<AdminCupInterface[]>(1);

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.adminDataService.getAllCups$().subscribe((cups: AdminCupInterface[]) => {
      this.cups = cups;
      this.cups$.next(cups);
    });
  }

  public confirmDelete(): void {}

  public finishCup(cupId: number): void {
    this.adminDataService
      .calculateCupRating$(cupId)
      .pipe(
        switchMap(() => this.adminDataService.finishOfflineCup$(cupId)),
        switchMap(() => this.adminDataService.getAllCups$(false)),
      )
      .subscribe((cups: AdminCupInterface[]) => {
        this.cups$.next(cups);
        this.snackBar.open('Cup finished successfully', 'OK', { duration: 2000 });
      });
  }
}
