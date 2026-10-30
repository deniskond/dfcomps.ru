import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  catchError,
  filter,
  from,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import {
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
  AnticheatDemoCheckInterface,
  AnticheatDemoCheckStatus,
  AnticheatPlayerDisplayInterface,
  AnticheatPlayerScoresInterface,
  VerifiedStatuses,
} from '@dfcomps/contracts';
import { Unpacked, formatResultTime } from '@dfcomps/helpers';
import { isSuperadmin } from '@dfcomps/auth';
import { UserService } from '~shared/services/user-service/user.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { isNonNull } from '~shared/helpers';

const MAX_SIMULTANEOUS_ANTICHEAT_CHECKS = 3;

@Component({
  selector: 'dfcomps.ru-admin-validate',
  templateUrl: './admin-validate.component.html',
  styleUrls: ['./admin-validate.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AdminValidateComponent implements OnInit, OnDestroy {
  public cupValidationInfo$: Observable<AdminValidationInterface>;
  public demoValidationStatuses = VerifiedStatuses;
  public validationForm: FormGroup;
  public anticheatStatuses = AnticheatDemoCheckStatus;
  public anticheatChecks: Record<number, AnticheatDemoCheckInterface> = {};
  public anticheatPlayerScores: Record<number, AnticheatPlayerDisplayInterface | null> = {};
  public showAnticheatPlayerScores = false;

  private onDestroy$ = new Subject<void>();

  constructor(
    private adminDataService: AdminDataService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.cupValidationInfo$ = this.activatedRoute.params.pipe(
      switchMap((params: Params) => this.adminDataService.getCupValidationInfo$(parseInt(params['id']))),
      tap((cupValidationInfo: AdminValidationInterface) => {
        this.initValidationForm(cupValidationInfo);
        this.startAnticheatChecks(cupValidationInfo);
        this.loadAnticheatPlayerScores(cupValidationInfo.cupInfo.id);
      }),
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public setAllDemosValid(): void {
    Object.keys(this.validationForm.controls).forEach((controlKey: string) => {
      if (controlKey.match(/demo/)) {
        this.validationForm.controls[controlKey].patchValue(true);
      }

      if (controlKey.match(/reason/)) {
        this.validationForm.controls[controlKey].patchValue('');
      }
    });
  }

  public submit(): void {
    this.activatedRoute.params
      .pipe(
        take(1),
        map((params: Params) => parseInt(params['id'])),
        switchMap((cupId: number) => this.adminDataService.sendValidationResult$(this.validationForm.value, cupId)),
        switchMap(() => this.adminDataService.getAllCups$(false)),
      )
      .subscribe(() => {
        this.router.navigate(['/admin/cups']);
        this.snackBar.open('Validation results submitted successfully!', '', { duration: 2000 });
      });
  }

  public formatTime(time: number): string {
    return formatResultTime(time);
  }

  private startAnticheatChecks({ vq3Demos, cpmDemos }: AdminValidationInterface): void {
    const demoIds: number[] = [...vq3Demos, ...cpmDemos].reduce(
      (ids: number[], player: AdminPlayerDemosValidationInterface) => [
        ...ids,
        ...player.demos.map(({ id }: Unpacked<AdminPlayerDemosValidationInterface['demos']>) => id),
      ],
      [],
    );

    from(demoIds)
      .pipe(
        mergeMap(
          (demoId: number) =>
            this.adminDataService.checkDemoWithAnticheat$(demoId).pipe(
              catchError(() => of<AnticheatDemoCheckInterface>({ status: AnticheatDemoCheckStatus.UNAVAILABLE })),
              map((check: AnticheatDemoCheckInterface) => ({ demoId, check })),
            ),
          MAX_SIMULTANEOUS_ANTICHEAT_CHECKS,
        ),
        takeUntil(this.onDestroy$),
      )
      .subscribe(({ demoId, check }: { demoId: number; check: AnticheatDemoCheckInterface }) => {
        this.anticheatChecks = { ...this.anticheatChecks, [demoId]: check };
        this.changeDetectorRef.markForCheck();
      });
  }

  private loadAnticheatPlayerScores(cupId: number): void {
    this.userService
      .getCurrentUser$()
      .pipe(
        filter(isNonNull),
        take(1),
        filter((user: UserInterface) => isSuperadmin(user.roles)),
        tap(() => {
          this.showAnticheatPlayerScores = true;
          this.changeDetectorRef.markForCheck();
        }),
        switchMap(() =>
          this.adminDataService.getAnticheatPlayerScores$(cupId).pipe(catchError(() => of({ scores: [] }))),
        ),
        takeUntil(this.onDestroy$),
      )
      .subscribe(({ scores }: AnticheatPlayerScoresInterface) => {
        this.anticheatPlayerScores = scores.reduce(
          (accumulator, { playerId, display }) => ({ ...accumulator, [playerId]: display }),
          {},
        );
        this.changeDetectorRef.markForCheck();
      });
  }

  private initValidationForm(cupValidationInfo: AdminValidationInterface): void {
    const cpmControls = this.getFormPhysicsControls(cupValidationInfo.cpmDemos);
    const vq3Controls = this.getFormPhysicsControls(cupValidationInfo.vq3Demos);

    this.validationForm = new FormGroup({ ...cpmControls, ...vq3Controls });
    this.changeDetectorRef.markForCheck();
  }

  private getValidationControlValue(validationStatus: VerifiedStatuses): boolean | null {
    const validationStatusMap: Record<VerifiedStatuses, boolean | null> = {
      [VerifiedStatuses.UNWATCHED]: null,
      [VerifiedStatuses.VALID]: true,
      [VerifiedStatuses.INVALID]: false,
    };

    return validationStatusMap[validationStatus];
  }

  private getFormPhysicsControls(playerDemos: AdminPlayerDemosValidationInterface[]): Record<string, AbstractControl> {
    return playerDemos.reduce((accumulator, playerDemos: AdminPlayerDemosValidationInterface) => {
      const playerDemosControls = playerDemos.demos.reduce(
        (acc, demo: Unpacked<AdminPlayerDemosValidationInterface['demos']>) => ({
          ...acc,
          ['demo_' + demo.id]: new FormControl(
            this.getValidationControlValue(demo.validationStatus),
            Validators.required,
          ),
          ['reason_' + demo.id]: new FormControl(demo.validationFailedReason),
          ['org_' + demo.id]: new FormControl(demo.isOrganizer),
          ['exclude_' + demo.id]: new FormControl(demo.isOutsideCompetition),
          ['impressive_' + demo.id]: new FormControl(demo.isImpressive),
        }),
        {},
      );

      return { ...accumulator, ...playerDemosControls };
    }, {});
  }
}
