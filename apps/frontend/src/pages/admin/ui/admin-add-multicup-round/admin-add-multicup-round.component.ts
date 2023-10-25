import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminActiveMulticupInterface } from '@dfcomps/contracts';

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

  public addMulticupRoundForm: FormGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
    shortName: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    mapType: new FormControl('custom', Validators.required),
    multicup: new FormControl('', Validators.required),
    mapName: new FormControl('', Validators.required),
    mapAuthor: new FormControl('', Validators.required),
    gauntlet: new FormControl(false, Validators.required),
    rocket: new FormControl(false, Validators.required),
    grenade: new FormControl(false, Validators.required),
    plasma: new FormControl(false, Validators.required),
    lignting: new FormControl(false, Validators.required),
    bfg: new FormControl(false, Validators.required),
    railgun: new FormControl(false, Validators.required),
    shotgun: new FormControl(false, Validators.required),
    grapplingHook: new FormControl(false, Validators.required),
    mapLevelshot: new FormControl('', Validators.required),
    mapPk3: new FormControl('', Validators.required),
    addNews: new FormControl(true),
  });

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.activeMulticups$ = this.adminDataService.getAllActiveMulticups$();
  }

  submit(): void {
    Object.keys(this.addMulticupRoundForm.controls).forEach((key: string) =>
      this.addMulticupRoundForm.get(key)!.markAsDirty(),
    );

    if (!this.addMulticupRoundForm.valid) {
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
}
