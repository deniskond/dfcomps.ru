import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReplaySubject, Subject, filter, switchMap, takeUntil } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminCupInterface } from '@dfcomps/contracts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { UserService } from '~shared/services/user-service/user.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { isNonNull } from '~shared/helpers';
import * as moment from 'moment';

@Component({
  selector: 'admin-cups',
  templateUrl: './admin-cups.component.html',
  styleUrls: ['./admin-cups.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCupsComponent implements OnInit {
  public cups: AdminCupInterface[];
  public cups$ = new ReplaySubject<AdminCupInterface[]>(1);
  private user: UserInterface | null = null;
  private onDestroy$ = new Subject<void>();

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.adminDataService.getAllCups$().subscribe((cups: AdminCupInterface[]) => {
      this.cups = cups;
      this.cups$.next(cups);
    });

    this.initCurrentUserSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public confirmDelete(cupId: number): void {}

  public isEditingCupAvailable(cup: AdminCupInterface): boolean {
    if (!this.user) {
      return false;
    }

    if (moment().isAfter(moment(cup.endDateTime))) {
      return false;
    }

    return checkUserRoles(this.user.roles, [UserRoles.CUP_ORGANIZER]);
  }

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

  private initCurrentUserSubscription(): void {
    this.userService
      .getCurrentUser$()
      .pipe(filter(isNonNull), takeUntil(this.onDestroy$))
      .subscribe((user: UserInterface) => {
        this.user = user;
        this.changeDetectorRef.markForCheck();
      });
  }
}
