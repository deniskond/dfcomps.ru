import { LanguageService } from '../../services/language/language.service';
import { Translations } from '../../components/translations/translations.component';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Physics } from '../../enums/physics.enum';
import { range } from 'lodash';
import { take, finalize } from 'rxjs/operators';

const CURRENT_SEASON = 3;
const MAX_PLAYERS_PER_PAGE = 100;

@Component({
    templateUrl: './rating.page.html',
    styleUrls: ['./rating.page.less'],
})
export class RatingPageComponent extends Translations implements OnInit {
    public currentPage = 1;
    public currentSeason = CURRENT_SEASON;
    public currentSeasonConst = CURRENT_SEASON;
    public vq3Ratings$ = new ReplaySubject<LeaderTableInterface[]>(1);
    public cpmRatings$ = new ReplaySubject<LeaderTableInterface[]>(1);
    public pagesCount$ = new ReplaySubject<number>(1);
    public range = range;
    public isLoadingVq3: boolean;
    public isLoadingCpm: boolean;
    public bias = 0;

    constructor(private ratingTablesService: RatingTablesService, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.loadCurrentSeasonPage(this.currentPage);
        super.ngOnInit();
    }

    public loadCurrentSeasonPage(page: number): void {
        this.isLoadingVq3 = true;
        this.isLoadingCpm = true;
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
                finalize(() => (this.isLoadingVq3 = false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.vq3Ratings$.next(ratingTable));

        this.ratingTablesService
            .getRatingTablePage$(Physics.CPM, page)
            .pipe(
                take(1),
                finalize(() => (this.isLoadingCpm = false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
    }

    public loadPreviousSeasonPage(page: number): void {
        this.isLoadingVq3 = true;
        this.isLoadingCpm = true;
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
                finalize(() => (this.isLoadingVq3 = false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.vq3Ratings$.next(ratingTable));

        this.ratingTablesService
            .getSeasonRatingTablePage$(Physics.CPM, page, this.currentSeason)
            .pipe(
                take(1),
                finalize(() => (this.isLoadingCpm = false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
    }

    public setSeason(season: number): void {
        this.currentSeason = season;
        season === CURRENT_SEASON ? this.loadCurrentSeasonPage(1) : this.loadPreviousSeasonPage(1);
    }
}
