import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { filter, finalize, switchMap, take, tap } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminMulticupActionInterface } from '@dfcomps/contracts';

@Component({
  selector: 'admin-multicup',
  templateUrl: './admin-multicup.component.html',
  styleUrls: ['./admin-multicup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMulticupComponent implements OnInit {
  public isLoadingMulticupAction = false;
  public isInitialLoading = true;
  public componentMode: 'Add' | 'Edit' = 'Add';
  public multicupForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    rounds: new FormControl('', Validators.required),
  });

  private multicupId: number | null = null;

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        take(1),
        filter(({ id }: Params) => !!id),
        tap(({ id }: Params) => (this.multicupId = parseInt(id))),
        switchMap(({ id }: Params) => this.adminDataService.getSingleMulticup$(id)),
        finalize(() => {
          this.isInitialLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe((multicup: AdminMulticupActionInterface) => {
        this.componentMode = 'Edit';
        this.setFormValues(multicup);
      });
  }

  public submit(): void {
    Object.keys(this.multicupForm.controls).forEach((key: string) => this.multicupForm.get(key)!.markAsDirty());

    if (!this.multicupForm.valid) {
      return;
    }

    this.isLoadingMulticupAction = true;
    this.componentMode === 'Add' ? this.addMulticup() : this.editMulticup();
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  private setFormValues(multicup: AdminMulticupActionInterface): void {
    this.multicupForm.setValue({
      name: multicup.name,
      rounds: multicup.rounds,
    });
  }

  private addMulticup(): void {
    const formValue: Record<string, any> = this.multicupForm.value;

    this.adminDataService
      .addMulticup$(formValue['name'], formValue['rounds'])
      .pipe(
        switchMap(() => this.adminDataService.getAllMulticups$(false)),
        finalize(() => (this.isLoadingMulticupAction = false)),
      )
      .subscribe(() => {
        this.router.navigate(['/admin/multicups']);
        this.snackBar.open('Multicup added successfully', 'OK', { duration: 3000 });
      });
  }

  private editMulticup(): void {
    const formValue: Record<string, any> = this.multicupForm.value;

    this.adminDataService
      .editMulticup$(formValue['name'], formValue['rounds'], this.multicupId!)
      .pipe(
        switchMap(() => this.adminDataService.getAllMulticups$(false)),
        finalize(() => (this.isLoadingMulticupAction = false)),
      )
      .subscribe(() => {
        this.router.navigate(['/admin/multicups']);
        this.snackBar.open('Multicup edited successfully', 'OK', { duration: 3000 });
      });
  }
}
