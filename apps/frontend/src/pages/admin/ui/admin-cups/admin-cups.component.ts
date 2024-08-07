import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReplaySubject, Subject, filter, switchMap, take, takeUntil } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminCupInterface, CupTypes, CupStates } from '@dfcomps/contracts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRoles, checkUserRoles, isSuperadmin } from '@dfcomps/auth';
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
  public cupTypes = CupTypes;
  public cupStates = CupStates;
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

  public confirmDelete(cup: AdminCupInterface): void {
    const snackBar = this.snackBar.open(`Are you sure you want to delete "${cup.fullName}"?`, 'Yes', {
      duration: 3000,
    });

    snackBar
      .onAction()
      .pipe(
        take(1),
        switchMap(() => this.adminDataService.deleteCup$(cup.id)),
      )
      .subscribe(() => {
        this.cups = this.cups.filter((cupEntry: AdminCupInterface) => cupEntry.id !== cup.id);
        this.cups$.next(this.cups);
        this.adminDataService.setCups(this.cups);
        this.snackBar.open(`Successfully deleted "${cup.fullName}"!`, '', { duration: 1000 });
      });
  }

  public isCupOrganizer(): boolean {
    if (!this.user) {
      return false;
    }

    return checkUserRoles(this.user.roles, [UserRoles.CUP_ORGANIZER]);
  }

  public finishOfflineCup(cupId: number): void {
    this.adminDataService
      .calculateCupRating$(cupId)
      .pipe(
        switchMap(() => this.adminDataService.finishOfflineCup$(cupId)),
        switchMap(() => this.adminDataService.getAllCups$(false)),
      )
      .subscribe((cups: AdminCupInterface[]) => {
        this.cups$.next(cups);
        this.snackBar.open('Offline cup finished successfully', 'OK', { duration: 2000 });
      });
  }

  public finishOnlineCup(cupId: number): void {
    this.adminDataService
      .finishOnlineCup$(cupId)
      .pipe(switchMap(() => this.adminDataService.getAllCups$(false)))
      .subscribe((cups: AdminCupInterface[]) => {
        this.cups$.next(cups);
        this.snackBar.open('Online cup finished successfully', 'OK', { duration: 2000 });
      });
  }

  public getCupEditLink(cup: AdminCupInterface): string {
    return cup.type === CupTypes.ONLINE ? `/admin/cups/online/edit/${cup.id}` : `/admin/cups/offline/edit/${cup.id}`;
  }

  public isValidationAvailable(cupState: CupStates, context: AdminCupsComponent): boolean {
    if (!context.user) {
      return false;
    }

    if (
      [CupStates.WAITING_FOR_FINISH, CupStates.WAITING_FOR_VALIDATION].includes(cupState) &&
      isSuperadmin(context.user.roles)
    ) {
      return true;
    }

    if (
      [CupStates.WAITING_FOR_VALIDATION].includes(cupState) &&
      checkUserRoles(context.user.roles, [UserRoles.VALIDATOR])
    ) {
      return true;
    }

    return false;
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
