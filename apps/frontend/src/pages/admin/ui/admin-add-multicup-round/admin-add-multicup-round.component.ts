import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, filter, finalize, switchMap, takeUntil, tap } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminActiveMulticupInterface, WorldspawnMapInfoInterface } from '@dfcomps/contracts';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'admin-add-multicup-round',
  templateUrl: './admin-add-multicup-round.component.html',
  styleUrls: ['./admin-add-multicup-round.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAddMulticupRoundComponent implements OnInit {
  @ViewChild('pk3FileInput') pk3Input: ElementRef;
  @ViewChild('levelshotFileInput') levelshotInput: ElementRef;

  public activeMulticups$: Observable<AdminActiveMulticupInterface[]>;
  public isMapFound: boolean | null = null;
  public isLoadingMapInfo = false;
  private onDestroy$ = new Subject<void>();

  public addMulticupRoundForm: FormGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
    shortName: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    mapType: new FormControl('ws', Validators.required),
    multicup: new FormControl('', Validators.required),
    mapName: new FormControl('', Validators.required),
    mapAuthor: new FormControl({ value: '', disabled: true }, Validators.required),
    gauntlet: new FormControl({ value: false, disabled: true }, Validators.required),
    rocket: new FormControl({ value: false, disabled: true }, Validators.required),
    grenade: new FormControl({ value: false, disabled: true }, Validators.required),
    plasma: new FormControl({ value: false, disabled: true }, Validators.required),
    lignting: new FormControl({ value: false, disabled: true }, Validators.required),
    bfg: new FormControl({ value: false, disabled: true }, Validators.required),
    railgun: new FormControl({ value: false, disabled: true }, Validators.required),
    shotgun: new FormControl({ value: false, disabled: true }, Validators.required),
    grapplingHook: new FormControl({ value: false, disabled: true }, Validators.required),
    mapLevelshotLink: new FormControl({ value: '', disabled: true }),
    mapLevelshotFile: new FormControl('', Validators.required),
    mapPk3Link: new FormControl({ value: '', disabled: true }),
    mapPk3File: new FormControl('', Validators.required),
    addNews: new FormControl(true),
  });

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.activeMulticups$ = this.adminDataService.getAllActiveMulticups$();
    this.initMapInfoSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public get isCustomMap(): boolean {
    return this.addMulticupRoundForm.get('mapType')!.value === 'custom';
  }

  public get isValidMapName(): boolean {
    return (!this.isLoadingMapInfo && !!this.isMapFound) || this.isCustomMap;
  }

  public initMapInfoSubscription(): void {
    this.addMulticupRoundForm
      .get('mapName')!
      .valueChanges.pipe(
        filter((value: string) => !!value && !this.isCustomMap),
        debounceTime(500),
        tap(() => {
          this.isLoadingMapInfo = true;
          this.isMapFound = null;
        }),
        switchMap((value: string) => this.adminDataService.getWorldspawnMapInfo$(value)),
        finalize(() => (this.isLoadingMapInfo = false)),
        takeUntil(this.onDestroy$),
      )
      .subscribe({
        next: (mapInfo: WorldspawnMapInfoInterface) => {
          this.setMapInfoFormValues(mapInfo);
          this.isMapFound = true;
        },
        error: () => {
          this.isMapFound = false;
        },
      });
  }

  public submit(): void {
    Object.keys(this.addMulticupRoundForm.controls).forEach((key: string) =>
      this.addMulticupRoundForm.get(key)!.markAsDirty(),
    );

    if (!this.addMulticupRoundForm.valid || !this.isValidMapName) {
      return;
    }

    this.adminDataService
      .addMulticupRound$(this.addMulticupRoundForm.value, {
        pk3: this.pk3Input.nativeElement.files[0],
        levelshot: this.levelshotInput.nativeElement.files[0],
      })
      .pipe(switchMap(() => this.adminDataService.getAllCups$(false)))
      .subscribe(() => {
        this.router.navigate(['/admin/cups']);
        this.snackBar.open('Cup added successfully', 'OK', { duration: 3000 });
      });
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  public onMapTypeChange({ value }: MatRadioChange): void {
    const weaponControls: string[] = [
      'gauntlet',
      'rocket',
      'grenade',
      'plasma',
      'lignting',
      'bfg',
      'railgun',
      'shotgun',
      'grapplingHook',
    ];

    if (value === 'ws') {
      this.addMulticupRoundForm.get('mapAuthor')!.disable();
      this.addMulticupRoundForm.get('mapLevelshotFile')!.disable();
      this.addMulticupRoundForm.get('mapPk3File')!.disable();
      weaponControls.forEach((controlName: string) => this.addMulticupRoundForm.get(controlName)!.disable());
    }

    if (value === 'custom') {
      this.addMulticupRoundForm.get('mapAuthor')!.enable();
      this.addMulticupRoundForm.get('mapLevelshotFile')!.enable();
      this.addMulticupRoundForm.get('mapPk3File')!.enable();
      weaponControls.forEach((controlName: string) => this.addMulticupRoundForm.get(controlName)!.enable());
    }

    this.addMulticupRoundForm.get('mapAuthor')!.setValue('');
    this.addMulticupRoundForm.get('mapAuthor')!.markAsPristine();

    weaponControls.forEach((controlName: string) => this.addMulticupRoundForm.get(controlName)!.setValue(false));
  }

  private setMapInfoFormValues(mapInfo: WorldspawnMapInfoInterface): void {
    this.addMulticupRoundForm.get('mapAuthor')!.setValue(mapInfo.author);
    this.addMulticupRoundForm.get('mapPk3Link')!.setValue(mapInfo.pk3);
    this.addMulticupRoundForm.get('mapLevelshotLink')!.setValue(mapInfo.levelshot);
    
    // TODO size + weapons
  }
}
