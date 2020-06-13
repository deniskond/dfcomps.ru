import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { Physics } from '../../enums/physics.enum';
import { range } from 'lodash';
import { take, finalize } from 'rxjs/operators';

const CURRENT_SEASON = 4;
const MAX_PLAYERS_PER_PAGE = 100;

@Component({
    templateUrl: './rating.page.html',
    styleUrls: ['./rating.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingPageComponent implements OnInit {
    public currentPage = 1;
    public currentSeason = CURRENT_SEASON;
    public currentSeasonConst = CURRENT_SEASON;
    public vq3Ratings$ = new ReplaySubject<LeaderTableInterface[]>(1);
    public cpmRatings$ = new ReplaySubject<LeaderTableInterface[]>(1);
    public pagesCount$ = new ReplaySubject<number>(1);
    public range = range;
    public isLoadingVq3$ = new Subject<boolean>();
    public isLoadingCpm$ = new Subject<boolean>();
    public bias = 0;

    constructor(private ratingTablesService: RatingTablesService) {}

    ngOnInit(): void {
        this.loadCurrentSeasonPage(this.currentPage);
    }

    public loadCurrentSeasonPage(page: number): void {
        this.isLoadingVq3$.next(true);
        this.isLoadingCpm$.next(true);
        this.currentPage = page;
        this.bias = (page - 1) * MAX_PLAYERS_PER_PAGE;

        this.ratingTablesService
            .getRatingTablePagesCount$()
            .pipe(take(1))
            .subscribe((pagesCount: number) => this.pagesCount$.next(pagesCount));

        this.ratingTablesService
            .getRatingTablePage$(Physics.VQ3, page)
            .pipe(
                take(1),
                finalize(() => this.isLoadingVq3$.next(false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.vq3Ratings$.next(ratingTable));

        this.ratingTablesService
            .getRatingTablePage$(Physics.CPM, page)
            .pipe(
                take(1),
                finalize(() => this.isLoadingCpm$.next(false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
    }

    public loadPreviousSeasonPage(page: number): void {
        this.isLoadingVq3$.next(true);
        this.isLoadingCpm$.next(true);
        this.currentPage = page;
        this.bias = (page - 1) * MAX_PLAYERS_PER_PAGE;

        this.ratingTablesService
            .getSeasonRatingTablePagesCount$(this.currentSeason)
            .pipe(take(1))
            .subscribe((pagesCount: number) => this.pagesCount$.next(pagesCount));

        this.ratingTablesService
            .getSeasonRatingTablePage$(Physics.VQ3, page, this.currentSeason)
            .pipe(
                take(1),
                finalize(() => this.isLoadingVq3$.next(false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.vq3Ratings$.next(ratingTable));

        this.ratingTablesService
            .getSeasonRatingTablePage$(Physics.CPM, page, this.currentSeason)
            .pipe(
                take(1),
                finalize(() => this.isLoadingCpm$.next(false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
    }

    public setSeason(season: number): void {
        this.currentSeason = season;
        season === CURRENT_SEASON ? this.loadCurrentSeasonPage(1) : this.loadPreviousSeasonPage(1);
    }
}
