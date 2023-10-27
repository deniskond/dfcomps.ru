import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import {
  AdminActiveMulticupInterface,
  UploadedFileLinkInterface,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';
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
  private mapType: 'ws' | 'custom' = 'ws';
  private weaponControls: string[] = [
    'gauntlet',
    'rocket',
    'grenade',
    'plasma',
    'lightning',
    'bfg',
    'railgun',
    'shotgun',
    'grapple',
  ];

  public addMulticupRoundForm: FormGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
    shortName: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    mapType: new FormControl('ws', Validators.required),
    multicup: new FormControl('', Validators.required),
    mapName: new FormControl('', Validators.required),
    mapAuthor: new FormControl('', Validators.required),
    gauntlet: new FormControl(false, Validators.required),
    rocket: new FormControl(false, Validators.required),
    grenade: new FormControl(false, Validators.required),
    plasma: new FormControl(false, Validators.required),
    lightning: new FormControl(false, Validators.required),
    bfg: new FormControl(false, Validators.required),
    railgun: new FormControl(false, Validators.required),
    shotgun: new FormControl(false, Validators.required),
    grapple: new FormControl(false, Validators.required),
    mapLevelshotLink: new FormControl(''),
    mapLevelshotFile: new FormControl({ value: '', disabled: true }, Validators.required),
    mapPk3Link: new FormControl(''),
    mapPk3File: new FormControl({ value: '', disabled: true }, Validators.required),
    addNews: new FormControl(true),
    size: new FormControl(''),
  });

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
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
        tap(() => (this.isMapFound = null)),
        filter((value: string) => !!value && !this.isCustomMap),
        debounceTime(500),
        tap(() => {
          this.isLoadingMapInfo = true;
        }),
        switchMap((value: string) =>
          this.adminDataService.getWorldspawnMapInfo$(value).pipe(catchError(() => of(null))),
        ),
        takeUntil(this.onDestroy$),
      )
      .subscribe((mapInfo: WorldspawnMapInfoInterface | null) => {
        this.isLoadingMapInfo = false;

        if (!mapInfo) {
          this.isMapFound = false;
          this.changeDetectorRef.markForCheck();
          return;
        }

        this.setMapInfoFormValues(mapInfo);
        this.isMapFound = true;
        this.changeDetectorRef.markForCheck();
      });
  }

  public submit(): void {
    Object.keys(this.addMulticupRoundForm.controls).forEach((key: string) =>
      this.addMulticupRoundForm.get(key)!.markAsDirty(),
    );

    if (!this.addMulticupRoundForm.valid || !this.isValidMapName) {
      return;
    }

    if (this.mapType === 'ws') {
      this.adminDataService
        .addCup$(this.addMulticupRoundForm.value)
        .pipe(switchMap(() => this.adminDataService.getAllCups$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/cups']);
          this.snackBar.open('Cup added successfully', 'OK', { duration: 3000 });
        });
    }

    if (this.mapType === 'custom') {
      const mapName: string = this.addMulticupRoundForm.get('mapName')!.value;

      combineLatest([
        this.adminDataService.addCustomMap$(this.pk3Input.nativeElement.files[0], mapName),
        this.adminDataService.addCustomLevelshot$(this.levelshotInput.nativeElement.files[0], mapName),
      ])
        .pipe(
          tap(([{ link: mapLink }, { link: levelshotLink }]: UploadedFileLinkInterface[]) => {
            this.addMulticupRoundForm.get('mapPk3Link')!.setValue(mapLink);
            this.addMulticupRoundForm.get('mapLevelshotLink')!.setValue(levelshotLink);
          }),
          switchMap(() => this.adminDataService.addCup$(this.addMulticupRoundForm.value)),
          switchMap(() => this.adminDataService.getAllCups$(false)),
        )
        .subscribe(() => {
          this.router.navigate(['/admin/cups']);
          this.snackBar.open('Cup added successfully', 'OK', { duration: 3000 });
        });
    }
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  public setMapSize(): void {
    if (this.pk3Input.nativeElement.files[0]) {
      const size: string = (this.pk3Input.nativeElement.files[0].size / (1024 * 1024)).toFixed(2);

      this.addMulticupRoundForm.get('size')!.setValue(size);
    }
  }

  public onMapTypeChange({ value }: MatRadioChange): void {
    if (value === 'ws') {
      this.addMulticupRoundForm.get('mapLevelshotFile')!.disable();
      this.addMulticupRoundForm.get('mapPk3File')!.disable();
    }

    if (value === 'custom') {
      this.addMulticupRoundForm.get('mapLevelshotFile')!.enable();
      this.addMulticupRoundForm.get('mapPk3File')!.enable();
    }

    this.isMapFound = null;
    this.mapType = value;
    this.addMulticupRoundForm.get('mapAuthor')!.setValue('');
    this.addMulticupRoundForm.get('mapAuthor')!.markAsPristine();
    this.addMulticupRoundForm.get('mapLevelshotLink')!.setValue('');
    this.addMulticupRoundForm.get('mapLevelshotLink')!.markAsPristine();
    this.addMulticupRoundForm.get('mapPk3Link')!.setValue('');
    this.addMulticupRoundForm.get('mapPk3Link')!.markAsPristine();
    this.addMulticupRoundForm.get('size')!.setValue('');
    this.weaponControls.forEach((controlName: string) => this.addMulticupRoundForm.get(controlName)!.setValue(false));
  }

  private setMapInfoFormValues(mapInfo: WorldspawnMapInfoInterface): void {
    this.addMulticupRoundForm.get('mapAuthor')!.setValue(mapInfo.author);
    this.addMulticupRoundForm.get('mapPk3Link')!.setValue(mapInfo.pk3);
    this.addMulticupRoundForm.get('mapLevelshotLink')!.setValue(mapInfo.levelshot);
    this.addMulticupRoundForm.get('size')!.setValue(mapInfo.size);

    this.weaponControls.forEach((control: string) =>
      this.addMulticupRoundForm
        .get(control)!
        .setValue(mapInfo.weapons[control as keyof WorldspawnMapInfoInterface['weapons']]),
    );
  }
}
