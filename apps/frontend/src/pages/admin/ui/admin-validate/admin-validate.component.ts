import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params } from '@angular/router';
import { map, Observable, switchMap, take, tap } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import {
  AdminDemoValidationStatuses,
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
} from '@dfcomps/contracts';

@Component({
  selector: 'dfcomps.ru-admin-validate',
  templateUrl: './admin-validate.component.html',
  styleUrls: ['./admin-validate.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminValidateComponent implements OnInit {
  public cupValidationInfo$: Observable<AdminValidationInterface>;
  public adminDemoValidationStatuses = AdminDemoValidationStatuses;
  public validationForm: FormGroup;

  constructor(
    private adminDataService: AdminDataService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cupValidationInfo$ = this.activatedRoute.params.pipe(
      switchMap((params: Params) => this.adminDataService.getCupValidationInfo$(params['id'])),
      tap((cupValidationInfo: AdminValidationInterface) => this.initValidationForm(cupValidationInfo)),
    );
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
        map((params: Params) => params['id']),
        switchMap((cupId: string) => this.adminDataService.sendValidationResult$(this.validationForm.value, cupId)),
      )
      .subscribe(() => this.snackBar.open('Validation results submitted successfully!', '', { duration: 2000 }));
  }

  private initValidationForm(cupValidationInfo: AdminValidationInterface): void {
    const cpmControls = this.getFormPhysicsControls(cupValidationInfo.cpmDemos);
    const vq3Controls = this.getFormPhysicsControls(cupValidationInfo.vq3Demos);

    this.validationForm = new FormGroup({ ...cpmControls, ...vq3Controls });
    this.changeDetectorRef.markForCheck();
  }

  private getValidationControlValue(validationStatus: AdminDemoValidationStatuses): boolean | null {
    const validationStatusMap: Record<AdminDemoValidationStatuses, boolean | null> = {
      [AdminDemoValidationStatuses.NOT_CHECKED]: null,
      [AdminDemoValidationStatuses.VALIDATED_OK]: true,
      [AdminDemoValidationStatuses.VALIDATED_FAILED]: false,
    };

    return validationStatusMap[validationStatus];
  }

  private getFormPhysicsControls(playerDemos: AdminPlayerDemosValidationInterface[]): Record<string, AbstractControl> {
    return playerDemos.reduce((accumulator, playerDemos: AdminPlayerDemosValidationInterface) => {
      const playerDemosControls = playerDemos.demos.reduce(
        (acc, demo) => ({
          ...acc,
          ['demo_' + demo.id]: new FormControl(
            this.getValidationControlValue(demo.validationStatus),
            Validators.required,
          ),
          ['reason_' + demo.id]: new FormControl(demo.validationFailedReason),
        }),
        {},
      );

      return { ...accumulator, ...playerDemosControls };
    }, {});
  }
}
