import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  Observable,
  Subject,
  filter,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminActiveMulticupInterface, AdminEditCupInterface } from '@dfcomps/contracts';
import * as moment from 'moment-timezone';

@Component({
  selector: 'admin-online-cup',
  templateUrl: './admin-online-cup.component.html',
  styleUrls: ['./admin-online-cup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOnlineCupComponent implements OnInit {
  public availableMulticups$: Observable<AdminActiveMulticupInterface[]>;
  public isMapFound: boolean | null = null;
  public isLoadingMapInfo = false;
  public isLoadingCupAction = false;
  public isMulticupRequired = true;
  public componentMode: 'Add' | 'Edit' = 'Add';
  public onlineCupForm: FormGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
    shortName: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    useTwoServers: new FormControl(true, Validators.required),
    server1: new FormControl(''),
    server2: new FormControl(''),
  });

  private onDestroy$ = new Subject<void>();
  private cupId: number | null = null;

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        take(1),
        filter(({ id }: Params) => !!id),
        tap(({ id }: Params) => (this.cupId = parseInt(id))),
        switchMap(({ id }: Params) => this.adminDataService.getSingleCup$(id)),
      )
      .subscribe((cup: AdminEditCupInterface) => {
        this.componentMode = 'Edit';
        this.setFormValues(cup);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public submit(): void {
    Object.keys(this.onlineCupForm.controls).forEach((key: string) => this.onlineCupForm.get(key)!.markAsDirty());

    if (!this.onlineCupForm.valid) {
      return;
    }

    this.isLoadingCupAction = true;
    this.componentMode === 'Add' ? this.addOnlineCup() : this.editOnlineCup();
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  private setFormValues(cup: AdminEditCupInterface): void {
    this.onlineCupForm.setValue({
      fullName: cup.fullName,
      shortName: cup.shortName,
      startTime: moment(cup.startTime).tz('Europe/Moscow').format('yyyy-MM-DDTHH:mm'),
      useTwoServers: cup.useTwoServers,
      server1: cup.server1,
      server2: cup.server2,
    });
  }

  private addOnlineCup(): void {
    // this.adminDataService
    //   .addOnlineCup$(this.onlineCupForm.value)
    //   .pipe(
    //     switchMap(() => this.adminDataService.getAllCups$(false)),
    //     finalize(() => (this.isLoadingCupAction = false)),
    //   )
    //   .subscribe(() => {
    //     this.router.navigate(['/admin/cups']);
    //     this.snackBar.open('Online cup added successfully', 'OK', { duration: 3000 });
    //   });
  }

  private editOnlineCup(): void {
    // this.adminDataService
    //   .editOnlineCup$(this.onlineCupForm.value, this.cupId!)
    //   .pipe(
    //     switchMap(() => this.adminDataService.getAllCups$(false)),
    //     finalize(() => (this.isLoadingCupAction = false)),
    //   )
    //   .subscribe(() => {
    //     this.router.navigate(['/admin/cups']);
    //     this.snackBar.open('Online cup edited successfully', 'OK', { duration: 3000 });
    //   });
  }
}
