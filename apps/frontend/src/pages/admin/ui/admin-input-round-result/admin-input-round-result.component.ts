import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminEditCupInterface } from '@dfcomps/contracts';
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
  public addSingleResultForm: FormGroup = new FormGroup({});
  public resultsForm: FormGroup = new FormGroup({});

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
  }

  public uploadServerLogs(): void {}
}
