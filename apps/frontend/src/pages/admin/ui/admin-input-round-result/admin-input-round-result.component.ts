import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
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
    time: new FormControl('', Validators.required),
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
              player: new FormControl(result.userId, Validators.required),
              time: new FormControl(result.time, Validators.required),
              servernick: new FormControl('-----'),
            }),
          );
        });

        this.changeDetectorRef.markForCheck();
      });
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
            player: new FormControl(roundResultRecord.suggestedPlayer?.userId, Validators.required),
            time: new FormControl(roundResultRecord.time, Validators.required),
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
        player: new FormControl(this.addSingleResultForm.get('player')!.value, Validators.required),
        time: new FormControl(this.addSingleResultForm.get('time')!.value, Validators.required),
        servernick: new FormControl('-----'),
      }),
    );

    this.sortResults();

    this.addSingleResultForm.setValue({
      player: '',
      time: '',
    });
  }

  public deleteResult(index: number): void {
    this.roundResultsFormArray.removeAt(index);
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

  private sortResults(): void {
    const allValuesSorted = this.roundResultsFormArray.value.sort((a, b) => a.time - b.time);

    this.roundResultsFormArray.setValue(allValuesSorted);
  }
}
