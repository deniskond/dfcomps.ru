import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'admin-add-multicup-round',
  templateUrl: './admin-add-multicup-round.component.html',
  styleUrls: ['./admin-add-multicup-round.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAddMulticupRoundComponent implements OnInit {
  public addMulticupRoundForm: FormGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
    shortName: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    mapType: new FormControl('ws', Validators.required),
    multicup: new FormControl('', Validators.required),
    mapName: new FormControl('', Validators.required),
    mapAuthor: new FormControl(''),
    gauntlet: new FormControl(false),
    rocket: new FormControl(false),
    plasma: new FormControl(false),
    lignting: new FormControl(false),
    bfg: new FormControl(false),
    railgun: new FormControl(false),
    shotgun: new FormControl(false),
    grapplingHook: new FormControl(false),
    mapLevelshot: new FormControl(''),
    mapPk3: new FormControl(''),
    addNews: new FormControl(true),
  });

  constructor() {}

  ngOnInit(): void {}

  submit(): void {}

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }
}
