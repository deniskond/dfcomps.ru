import { Injectable } from '@angular/core';
import { WarcupStateInterface, WarcupSuggestionStatsInterface, WarcupVotingInterface } from '@dfcomps/contracts';
import { Observable } from 'rxjs';
import { BackendService, URL_PARAMS } from '~shared/rest-api';

@Injectable({
  providedIn: 'root',
})
export class AdminWarcupDataService {
  constructor(private backendService: BackendService) {}

  public getWarcupState$(): Observable<WarcupStateInterface> {
    return this.backendService.get$<WarcupStateInterface>(URL_PARAMS.ADMIN.WARCUP.STATE);
  }

  public getWarcupSuggestionStats$(): Observable<WarcupSuggestionStatsInterface> {
    return this.backendService.get$<WarcupSuggestionStatsInterface>(URL_PARAMS.ADMIN.WARCUP.SUGGESTION_STATS);
  }

  public getWarcupVotingInfo$(): Observable<WarcupVotingInterface> {
    return this.backendService.get$<WarcupVotingInterface>(URL_PARAMS.ADMIN.WARCUP.VOTING_INFO);
  }

  public warcupVote$(mapSuggestionId: number): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.WARCUP.VOTE, { mapSuggestionId });
  }

  public adminSuggest$(mapName: string): Observable<void> {
    return this.backendService.post$<void>(URL_PARAMS.ADMIN.WARCUP.ADMIN_SUGGEST, { mapName });
  }
}
