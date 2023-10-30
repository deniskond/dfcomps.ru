import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Data, Params, Router } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  of,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import {
  AdminActiveMulticupInterface,
  AdminEditOfflineCupInterface,
  UploadedFileLinkInterface,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'admin-offline-cup',
  templateUrl: './admin-offline-cup.component.html',
  styleUrls: ['./admin-offline-cup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOfflineCupComponent implements OnInit {
  @ViewChild('pk3FileInput') pk3Input: ElementRef;
  @ViewChild('levelshotFileInput') levelshotInput: ElementRef;

  public activeMulticups$: Observable<AdminActiveMulticupInterface[]>;
  public isMapFound: boolean | null = null;
  public isLoadingMapInfo = false;
  public isMulticupRequired = true;
  public componentMode: 'Add' | 'Edit' = 'Add';
  public offlineCupForm: FormGroup = new FormGroup({
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

  private onDestroy$ = new Subject<void>();
  private mapType: 'ws' | 'custom' = 'ws';
  private cupId: number | null = null;
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

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activeMulticups$ = this.adminDataService.getAllActiveMulticups$();
    this.initMapInfoSubscription();

    this.route.data.pipe(take(1)).subscribe(({ multicup }: Data) => {
      if (!multicup) {
        this.offlineCupForm.get('multicup')!.clearValidators();
        this.isMulticupRequired = false;
      }
    });

    this.route.params
      .pipe(
        take(1),
        filter(({ id }: Params) => !!id),
        tap(({ id }: Params) => (this.cupId = parseInt(id))),
        switchMap(({ id }: Params) => this.adminDataService.getSingleCup$(id)),
      )
      .subscribe((cup: AdminEditOfflineCupInterface) => {
        this.componentMode = 'Edit';
        this.setFormValues(cup);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public get isCustomMap(): boolean {
    return this.offlineCupForm.get('mapType')!.value === 'custom';
  }

  public get isValidMapName(): boolean {
    return (!this.isLoadingMapInfo && !!this.isMapFound) || this.isCustomMap;
  }

  public initMapInfoSubscription(): void {
    this.offlineCupForm
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
    Object.keys(this.offlineCupForm.controls).forEach((key: string) => this.offlineCupForm.get(key)!.markAsDirty());

    if (!this.offlineCupForm.valid || !this.isValidMapName) {
      return;
    }

    this.componentMode === 'Add' ? this.addCup() : this.editCup();
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  public setMapSize(): void {
    if (this.pk3Input.nativeElement.files[0]) {
      const size: string = (this.pk3Input.nativeElement.files[0].size / (1024 * 1024)).toFixed(2);

      this.offlineCupForm.get('size')!.setValue(size);
    }
  }

  public onMapTypeChange({ value }: MatRadioChange): void {
    if (value === 'ws') {
      this.offlineCupForm.get('mapLevelshotFile')!.disable();
      this.offlineCupForm.get('mapPk3File')!.disable();
    }

    if (value === 'custom') {
      this.offlineCupForm.get('mapLevelshotFile')!.enable();
      this.offlineCupForm.get('mapPk3File')!.enable();
    }

    this.isMapFound = null;
    this.mapType = value;
    this.offlineCupForm.get('mapAuthor')!.setValue('');
    this.offlineCupForm.get('mapAuthor')!.markAsPristine();
    this.offlineCupForm.get('mapLevelshotLink')!.setValue('');
    this.offlineCupForm.get('mapLevelshotLink')!.markAsPristine();
    this.offlineCupForm.get('mapPk3Link')!.setValue('');
    this.offlineCupForm.get('mapPk3Link')!.markAsPristine();
    this.offlineCupForm.get('size')!.setValue('');
    this.weaponControls.forEach((controlName: string) => this.offlineCupForm.get(controlName)!.setValue(false));
  }

  private setMapInfoFormValues(mapInfo: WorldspawnMapInfoInterface): void {
    this.offlineCupForm.get('mapAuthor')!.setValue(mapInfo.author);
    this.offlineCupForm.get('mapPk3Link')!.setValue(mapInfo.pk3);
    this.offlineCupForm.get('mapLevelshotLink')!.setValue(mapInfo.levelshot);
    this.offlineCupForm.get('size')!.setValue(mapInfo.size);

    this.weaponControls.forEach((control: string) =>
      this.offlineCupForm
        .get(control)!
        .setValue(mapInfo.weapons[control as keyof WorldspawnMapInfoInterface['weapons']]),
    );
  }

  private setFormValues(cup: AdminEditOfflineCupInterface): void {
    this.offlineCupForm.setValue({
      fullName: cup.fullName,
      shortName: cup.shortName,
      startTime: cup.startTime,
      endTime: cup.endTime,
      mapType: cup.mapType,
      multicup: cup.multicupId,
      mapName: cup.mapName,
      mapAuthor: cup.author,
      gauntlet: cup.weapons.includes('U'),
      rocket: cup.weapons.includes('R'),
      grenade: cup.weapons.includes('G'),
      plasma: cup.weapons.includes('P'),
      lightning: cup.weapons.includes('L'),
      bfg: cup.weapons.includes('B'),
      railgun: cup.weapons.includes('I'),
      shotgun: cup.weapons.includes('S'),
      grapple: cup.weapons.includes('H'),
      mapLevelshotLink: cup.mapLevelshot,
      mapLevelshotFile: null,
      mapPk3File: null,
      mapPk3Link: cup.mapPk3,
      size: cup.size,
      addNews: cup.addNews,
    });

    if (cup.mapType === 'custom') {
      this.offlineCupForm.get('mapLevelshotFile')!.enable();
      this.offlineCupForm.get('mapPk3File')!.enable();
      this.offlineCupForm.get('mapLevelshotFile')!.clearValidators();
      this.offlineCupForm.get('mapPk3File')!.clearValidators();
    }

    if (cup.multicupId) {
      this.isMulticupRequired = true;
    }
  }

  private addCup(): void {
    if (this.mapType === 'ws') {
      this.adminDataService
        .addCup$(this.offlineCupForm.value)
        .pipe(switchMap(() => this.adminDataService.getAllCups$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/cups']);
          this.snackBar.open('Cup added successfully', 'OK', { duration: 3000 });
        });
    }

    if (this.mapType === 'custom') {
      const mapName: string = this.offlineCupForm.get('mapName')!.value;

      combineLatest([
        this.adminDataService.addCustomMap$(this.pk3Input.nativeElement.files[0], mapName),
        this.adminDataService.addCustomLevelshot$(this.levelshotInput.nativeElement.files[0], mapName),
      ])
        .pipe(
          tap(([{ link: mapLink }, { link: levelshotLink }]: UploadedFileLinkInterface[]) => {
            this.offlineCupForm.get('mapPk3Link')!.setValue(mapLink);
            this.offlineCupForm.get('mapLevelshotLink')!.setValue(levelshotLink);
          }),
          switchMap(() => this.adminDataService.addCup$(this.offlineCupForm.value)),
          switchMap(() => this.adminDataService.getAllCups$(false)),
        )
        .subscribe(() => {
          this.router.navigate(['/admin/cups']);
          this.snackBar.open('Cup added successfully', 'OK', { duration: 3000 });
        });
    }
  }

  private editCup(): void {
    if (this.mapType === 'ws') {
      this.adminDataService
        .editCup$(this.offlineCupForm.value, this.cupId!)
        .pipe(switchMap(() => this.adminDataService.getAllCups$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/cups']);
          this.snackBar.open('Cup edited successfully', 'OK', { duration: 3000 });
        });
    }

    if (this.mapType === 'custom') {
      const mapName: string = this.offlineCupForm.get('mapName')!.value;
      const pk3FileValue: string | undefined = this.offlineCupForm.get('mapPk3File')!.value;
      const levelshotFileValue: string | undefined = this.offlineCupForm.get('mapLevelshotFile')!.value;

      combineLatest([
        pk3FileValue ? this.adminDataService.addCustomMap$(this.pk3Input.nativeElement.files[0], mapName) : of(null),
        levelshotFileValue
          ? this.adminDataService.addCustomLevelshot$(this.levelshotInput.nativeElement.files[0], mapName)
          : of(null),
      ])
        .pipe(
          tap(([uploadedMap, uploadedLevelshot]: (UploadedFileLinkInterface | null)[]) => {
            if (uploadedMap) {
              this.offlineCupForm.get('mapPk3Link')!.setValue(uploadedMap.link);
            }

            if (uploadedLevelshot) {
              this.offlineCupForm.get('mapLevelshotLink')!.setValue(uploadedLevelshot.link);
            }
          }),
          switchMap(() => this.adminDataService.editCup$(this.offlineCupForm.value, this.cupId!)),
          switchMap(() => this.adminDataService.getAllCups$(false)),
        )
        .subscribe(() => {
          this.router.navigate(['/admin/cups']);
          this.snackBar.open('Cup edited successfully', 'OK', { duration: 3000 });
        });
    }
  }
}
