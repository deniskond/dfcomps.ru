import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReplaySubject, Subject, filter, switchMap, take, takeUntil } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { UserService } from '~shared/services/user-service/user.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { isNonNull } from '~shared/helpers';
import { AdminMulticupInterface } from '@dfcomps/contracts';

@Component({
  selector: 'admin-multicups',
  templateUrl: './admin-multicups.component.html',
  styleUrls: ['./admin-multicups.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMulticupsComponent implements OnInit {
  public multicups: AdminMulticupInterface[];
  public multicups$ = new ReplaySubject<AdminMulticupInterface[]>(1);
  private user: UserInterface | null = null;
  private onDestroy$ = new Subject<void>();

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.adminDataService.getAllMulticups$().subscribe((multicups: AdminMulticupInterface[]) => {
      this.multicups = multicups;
      this.multicups$.next(multicups);
    });

    this.initCurrentUserSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public confirmDelete(multicup: AdminMulticupInterface): void {
    const snackBar = this.snackBar.open(`Are you sure you want to delete "${multicup.name}"?`, 'Yes', {
      duration: 3000,
    });

    snackBar
      .onAction()
      .pipe(
        take(1),
        switchMap(() => this.adminDataService.deleteMulticup$(multicup.id)),
      )
      .subscribe(() => {
        this.multicups = this.multicups.filter((cupEntry: AdminMulticupInterface) => cupEntry.id !== multicup.id);
        this.multicups$.next(this.multicups);
        this.adminDataService.setMulticups(this.multicups);
        this.snackBar.open(`Successfully deleted "${multicup.name}"!`, '', { duration: 1000 });
      });
  }

  public isCupOrganizer(): boolean {
    if (!this.user) {
      return false;
    }

    return checkUserRoles(this.user.roles, [UserRoles.CUP_ORGANIZER]);
  }

  public isEditingMulticupAvailable(multicup: AdminMulticupInterface): boolean {
    if (!this.user) {
      return false;
    }

    if (multicup.isFinished) {
      return false;
    }

    return checkUserRoles(this.user.roles, [UserRoles.CUP_ORGANIZER]);
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
