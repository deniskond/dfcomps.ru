import { CupsService } from '../../services/cups/cups.service';
import { CupInterface } from '../../interfaces/cup.interface';
import { Physics } from '../../enums/physics.enum';
import { CupTypes } from '../../enums/cup-types.enum';
import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { UserService } from '../../services/user-service/user.service';
import { withLatestFrom, tap, map, filter, switchMap } from 'rxjs/operators';
import { UserInterface } from '../../interfaces/user.interface';
import { RatingTablesModes } from '../../enums/rating-tables-modes.enum';

@Component({
    templateUrl: './main-site.component.html',
    styleUrls: ['./main-site.component.less'],
})
export class MainSiteComponent implements OnInit {
    public cupTypes = CupTypes;
    public physics = Physics;
    public nextCupInfo$ = new ReplaySubject<CupInterface>(1);
    public server$: Observable<string>;
    public activePage = Math.random() > 0.5 ? 1 : 2;
    public ratingtablesModes = RatingTablesModes;

    constructor(private cupsService: CupsService, private userService: UserService) {}

    ngOnInit(): void {
        this.cupsService.getNextCupInfo$().subscribe((nextCup: CupInterface) => this.nextCupInfo$.next(nextCup));

        // TODO Здесь нужен стор
        this.server$ = this.userService.getCurrentUser$().pipe(
            filter((user) => !!user),
            withLatestFrom(this.nextCupInfo$),
            switchMap(([user, cup]: [UserInterface, CupInterface]) =>
                this.cupsService.checkIfPlayerRegistered$(cup.id, user.id).pipe(
                    filter(Boolean),
                    map(() => [user, cup]),
                ),
            ),
            map(([user, cup]: [UserInterface, CupInterface]) => (parseInt(user.id) % 2 === 0 ? cup.server2 : cup.server1)),
        );
    }

    public setTab(index: number): void {
        this.activePage = index;
    }
}
