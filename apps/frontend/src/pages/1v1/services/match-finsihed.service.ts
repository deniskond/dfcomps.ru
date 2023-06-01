import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

// TODO Remove this service, it only exists to sync 1v1 page and widget on match result accpeted
@Injectable({
  providedIn: 'root',
})
export class MatchFinishedService {
  private _matchFinished$ = new Subject<void>();

  public get matchFinished$(): Observable<void> {
    return this._matchFinished$.asObservable();
  }

  public onMatchFinished(): void {
    this._matchFinished$.next();
  }
}
