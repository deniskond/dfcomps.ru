import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminEditCupInterface, OnlineCupPlayersInterface } from '@dfcomps/contracts';
import { AdminDataService } from '~pages/admin/business/admin-data.service';

@Component({
  selector: 'admin-input-round-result',
  templateUrl: './admin-input-round-result.component.html',
  styleUrls: ['./admin-input-round-result.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInputRoundResultComponent implements OnInit {
  public cupId: number;
  public cupName: string;
  public roundNumber: number;
  public hasTwoServers: boolean;
  public addSingleResultForm: FormGroup = new FormGroup({
    player: new FormControl('', Validators.required),
    time: new FormControl('', Validators.required),
  });
  public roundResultsForm: FormGroup = new FormGroup({});
  public results = new Array(5).fill(null);
  public cupPlayers: OnlineCupPlayersInterface['players'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminDataService: AdminDataService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cupId = this.activatedRoute.snapshot.params['id'];
    this.roundNumber = this.activatedRoute.snapshot.params['round'];

    this.adminDataService.getSingleCup$(this.cupId).subscribe((cupInfo: AdminEditCupInterface) => {
      this.cupName = cupInfo.fullName;
      this.hasTwoServers = cupInfo.useTwoServers;
      this.changeDetectorRef.markForCheck();
    });

    this.adminDataService.getOnlineCupPlayers$(this.cupId).subscribe((cupPlayers: OnlineCupPlayersInterface) => {
      this.cupPlayers = cupPlayers.players;
      this.changeDetectorRef.markForCheck();
    });
  }

  public uploadServerLogs(): void {}

  public addSingleResult(): void {
    this.addSingleResultForm.setValue({
      player: '',
      time: '',
    });
  }

  public deleteResult(): void {}

  public saveRoundResults(): void {}
}
