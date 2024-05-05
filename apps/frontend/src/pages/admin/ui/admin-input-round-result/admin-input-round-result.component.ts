import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  AdminEditCupInterface,
  OnlineCupPlayersInterface,
  OnlineCupRoundResultsInterface,
  ParsedOnlineCupRoundInterface,
} from '@dfcomps/contracts';
import { Unpacked } from '@dfcomps/helpers';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { AdminDataService } from '~pages/admin/business/admin-data.service';

@Component({
  selector: 'admin-input-round-result',
  templateUrl: './admin-input-round-result.component.html',
  styleUrls: ['./admin-input-round-result.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInputRoundResultComponent implements OnInit {
  @ViewChild('serverLogsInput1') serverLogsInput1: ElementRef;
  @ViewChild('serverLogsInput2') serverLogsInput2: ElementRef;

  public cupId: number;
  public cupName: string;
  public roundNumber: number;
  public hasTwoServers: boolean;
  public uploadLogsForm: FormGroup = new FormGroup({
    server1: new FormControl('', Validators.required),
    server2: new FormControl('', Validators.required),
  });
  public addSingleResultForm: FormGroup = new FormGroup({
    player: new FormControl('', Validators.required),
    time: new FormControl('', [Validators.required, this.timeFormatValidator('time')]),
  });
  public roundResultsFormArray = new FormArray<FormGroup>([]);
  public cupPlayers: OnlineCupPlayersInterface['players'];
  public range = (length: number) => new Array(+length).fill(null);

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminDataService: AdminDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cupId = this.activatedRoute.snapshot.params['id'];
    this.roundNumber = this.activatedRoute.snapshot.params['round'];

    this.adminDataService.getSingleCup$(this.cupId).subscribe((cupInfo: AdminEditCupInterface) => {
      this.cupName = cupInfo.fullName;
      this.hasTwoServers = cupInfo.useTwoServers;

      if (!this.hasTwoServers) {
        this.uploadLogsForm.get('server2')!.clearValidators();
      }

      this.changeDetectorRef.markForCheck();
    });

    this.adminDataService.getOnlineCupPlayers$(this.cupId).subscribe((cupPlayers: OnlineCupPlayersInterface) => {
      this.cupPlayers = cupPlayers.players;
      this.changeDetectorRef.markForCheck();
    });

    this.adminDataService
      .getOnlineCupRoundResults$(this.cupId, this.roundNumber)
      .subscribe((roundResults: OnlineCupRoundResultsInterface) => {
        roundResults.results.forEach((result: Unpacked<OnlineCupRoundResultsInterface['results']>) => {
          this.roundResultsFormArray.push(
            new FormGroup({
              player: new FormControl(result.userId, [
                Validators.required,
                this.playerDuplicateValidator('player').bind(this),
              ]),
              time: new FormControl(result.time, [Validators.required, this.timeFormatValidator('time')]),
              servernick: new FormControl('-----'),
            }),
          );
        });

        this.changeDetectorRef.markForCheck();
      });
  }

  // Valid times: `0.008`, `2`, `2.8`, `2.84`, `2.848` (divisible by 8ms, has leading number, 0-3 digits after the dot)
  // Invalid times: `.008`, `3.`, `3.1`, `3.15`, `3.157`, `3.1600`
  public timeFormatValidator(controlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.value) {
        return null;
      }

      const stringTime: string = control.value;

      if (!stringTime.toString().match(/^\d+((\..{1,3})|())$/)) {
        return { [controlName]: 'Wrong time format' };
      }

      const time: number = Math.floor(parseFloat(stringTime) * 1000);

      return time % 8 === 0 ? null : { [controlName]: 'Time is not divisible by 0.008' };
    };
  }

  public playerDuplicateValidator(controlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.value) {
        return null;
      }

      const userId: number = control.value;

      const hasDuplicate: boolean =
        this.roundResultsFormArray.controls.filter((formGroup: FormGroup) => formGroup.get('player')!.value === userId)
          .length > 1;

      return hasDuplicate ? { [controlName]: 'Duplicate player in results' } : null;
    };
  }

  public updateFormValidity(): void {
    this.roundResultsFormArray.controls.forEach((formGroup: FormGroup) =>
      formGroup.get('player')!.updateValueAndValidity(),
    );
  }

  public uploadServerLogs(): void {
    let targetObservable$: Observable<ParsedOnlineCupRoundInterface>;

    if (!this.hasTwoServers) {
      const logs1: File = this.serverLogsInput1.nativeElement.files[0];

      targetObservable$ = this.adminDataService.uploadServerLogs$(this.cupId, logs1);
    } else {
      const logs1: File = this.serverLogsInput1.nativeElement.files[0];
      const logs2: File = this.serverLogsInput2.nativeElement.files[0];

      targetObservable$ = combineLatest([
        this.adminDataService.uploadServerLogs$(this.cupId, logs1),
        this.adminDataService.uploadServerLogs$(this.cupId, logs2),
      ]).pipe(
        map(([parsedLogs1, parsedLogs2]: [ParsedOnlineCupRoundInterface, ParsedOnlineCupRoundInterface]) => {
          const sortedRoundResults: ParsedOnlineCupRoundInterface['roundResults'] = [
            ...parsedLogs1.roundResults,
            ...parsedLogs2.roundResults,
          ].sort(
            (
              resultA: Unpacked<ParsedOnlineCupRoundInterface['roundResults']>,
              resultB: Unpacked<ParsedOnlineCupRoundInterface['roundResults']>,
            ) => resultA.time - resultB.time,
          );

          return {
            roundResults: sortedRoundResults,
          };
        }),
      );
    }

    targetObservable$.subscribe((parsedRound: ParsedOnlineCupRoundInterface) => {
      parsedRound.roundResults.forEach((roundResultRecord: Unpacked<ParsedOnlineCupRoundInterface['roundResults']>) =>
        this.roundResultsFormArray.push(
          new FormGroup({
            servernick: new FormControl(roundResultRecord.serverNick),
            player: new FormControl(roundResultRecord.suggestedPlayer?.userId, [
              Validators.required,
              this.playerDuplicateValidator('player').bind(this),
            ]),
            time: new FormControl(roundResultRecord.time, [Validators.required, this.timeFormatValidator('time')]),
          }),
        ),
      );

      this.sortResults();
      this.changeDetectorRef.markForCheck();
    });
  }

  public addSingleResult(): void {
    this.roundResultsFormArray.push(
      new FormGroup({
        player: new FormControl(this.addSingleResultForm.get('player')!.value, [
          Validators.required,
          this.playerDuplicateValidator('player').bind(this),
        ]),
        time: new FormControl(this.addSingleResultForm.get('time')!.value, [
          Validators.required,
          this.timeFormatValidator('time'),
        ]),
        servernick: new FormControl('-----'),
      }),
    );

    this.sortResults();

    this.addSingleResultForm.setValue({
      player: '',
      time: '',
    });

    this.addSingleResultForm.markAsPristine();
    this.updateFormValidity();
  }

  public deleteResult(index: number): void {
    this.roundResultsFormArray.removeAt(index);
    this.updateFormValidity();
  }

  public saveRoundResults(): void {
    this.adminDataService
      .saveOnlineCupRoundResults$(
        this.cupId,
        this.roundNumber,
        this.roundResultsFormArray.value.map(({ player, time }: { player: number; time: number }) => ({
          userId: player,
          time,
        })),
      )
      .pipe(switchMap(() => this.adminDataService.getAllCups$(false)))
      .subscribe(() => {
        this.snackBar.open('Online cup round results saved successfully', 'OK', { duration: 3000 });
      });
  }

  public hasFieldError(control: AbstractControl): boolean {
    return control!.status === 'INVALID' && !control!.pristine;
  }

  public hasPristineFieldError(control: AbstractControl): boolean {
    return control!.status === 'INVALID';
  }

  private sortResults(): void {
    const allValuesSorted = this.roundResultsFormArray.value.sort((a, b) => a.time - b.time);

    this.roundResultsFormArray.setValue(allValuesSorted);
  }
}
