import { CupsService } from '../../services/cups/cups.service';
import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { UserService } from '../../services/user-service/user.service';
import { map, filter, switchMap } from 'rxjs/operators';
import { isNonNull } from '../../../shared/helpers';
import { CupInterface, CupTypes, Physics, RatingTablesModes } from '@dfcomps/contracts';
@Component({
  templateUrl: './main-site.component.html',
  styleUrls: ['./main-site.component.less'],
})
export class MainSiteComponent implements OnInit {
  public cupTypes = CupTypes;
  public physics = Physics;
  public nextCupInfo$ = new ReplaySubject<CupInterface>(1);
  public server$: Observable<string | null>;
  public activePage = Math.random() > 0.5 ? 1 : 2;
  public ratingtablesModes = RatingTablesModes;

  constructor(
    private cupsService: CupsService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.cupsService.getNextCupInfo$().subscribe((nextCup: CupInterface) => this.nextCupInfo$.next(nextCup));

    // TODO Some type of storage is needed here
    this.server$ = this.userService.getCurrentUser$().pipe(
      filter(isNonNull),
      switchMap(() =>
        this.nextCupInfo$.pipe(filter((nextCupInfo: CupInterface) => nextCupInfo.type === CupTypes.ONLINE)),
      ),
      switchMap((cup: CupInterface) =>
        this.cupsService.checkIfPlayerRegistered$(cup.id).pipe(
          filter(Boolean),
          map(() => cup),
        ),
      ),
      map((cup: CupInterface) => cup.server),
    );
  }

  public setTab(index: number): void {
    this.activePage = index;
  }

  public getCupTimerName(nextCupInfo: CupInterface): string {
    // For online cups, fullName is usually something like "Online Cup #16", and shortName is something like "VQ3 Plasma".
    // For offline cups, fullName usually matches shortName, but shortName is set manually when the cup name is too long. 
    // For example, "FPS Winter Cup - Round 3" will have the manual shortName "FPS Winter Cup - R3".
    return nextCupInfo.type === CupTypes.ONLINE ? nextCupInfo.fullName : nextCupInfo.shortName;
  }
}
