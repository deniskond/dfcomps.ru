import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WarcupStateInterface, WarcupSuggestionStatsInterface, WarcupVotingState } from '@dfcomps/contracts';
import { AdminWarcupDataService } from '~pages/admin/business/admin-warcup-data.service';

@Component({
  selector: 'admin-warcup-selection',
  templateUrl: './admin-warcup-selection.component.html',
  styleUrls: ['./admin-warcup-selection.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWarcupSelectionComponent implements OnInit {
  public title: string;
  public warcupSuggestionStats: WarcupSuggestionStatsInterface;
  public selectedMap: string;
  public isLoading = true;
  public warcupVotingState: WarcupVotingState | null = null;
  public warcupVotingStates = WarcupVotingState;

  constructor(
    private adminWarcupDataService: AdminWarcupDataService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getWarcupState();
  }

  private getWarcupState(): void {
    this.adminWarcupDataService.getWarcupState$().subscribe((warcupState: WarcupStateInterface) => {
      this.title = this.mapStateToComponentTitle(warcupState.state);
      this.warcupVotingState = warcupState.state;

      if (warcupState.state === WarcupVotingState.WAITING || warcupState.state === WarcupVotingState.PAUSED) {
        this.getSuggestionStats();
      }

      if (warcupState.state === WarcupVotingState.VOTING || warcupState.state === WarcupVotingState.CLOSING) {
        this.getWarcupVotingInfo();
      }
    });
  }

  private getSuggestionStats(): void {
    this.adminWarcupDataService
      .getWarcupSuggestionStats$()
      .subscribe((warcupSuggestionStats: WarcupSuggestionStatsInterface) => {
        this.warcupSuggestionStats = warcupSuggestionStats;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  private getWarcupVotingInfo(): void {
    this.adminWarcupDataService.getWarcupVotingInfo$().subscribe(() => {
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private mapStateToComponentTitle(votingState: WarcupVotingState): string {
    return {
      [WarcupVotingState.CLOSING]: 'Warcup voting finished, waiting for Warcup start',
      [WarcupVotingState.PAUSED]: 'Warcups are currently paused',
      [WarcupVotingState.VOTING]: 'Warcup voting in progress',
      [WarcupVotingState.WAITING]: 'Waiting for the next warcup vote',
    }[votingState];
  }
}
