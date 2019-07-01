import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Physics } from '../../enums/physics.enum';
import { range } from 'lodash';
import { take, finalize } from 'rxjs/operators';

@Component({
    templateUrl: './rating.page.html',
    styleUrls: ['./rating.page.less'],
})
export class RatingPageComponent implements OnInit {
    public currentPage = 1;
    public pagesCount$: Observable<number>;
    public vq3Ratings$ = new ReplaySubject<LeaderTableInterface[]>(1);
    public cpmRatings$ = new ReplaySubject<LeaderTableInterface[]>(1);
    public range = range;
    public isLoadingVq3: boolean;
    public isLoadingCpm: boolean;

    constructor(private ratingTablesService: RatingTablesService) {}

    ngOnInit(): void {
        this.loadPage(this.currentPage);
        this.pagesCount$ = this.ratingTablesService.getRatingTablePagesCount$();
    }

    public loadPage(page: number): void {
        this.isLoadingVq3 = true;
        this.isLoadingCpm = true;

        this.ratingTablesService
            .getRatingTablePage$(Physics.VQ3, page)
            .pipe(
                take(1),
                finalize(() => (this.isLoadingVq3 = false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => {
                this.vq3Ratings$.next(ratingTable);
            });

        this.ratingTablesService
            .getRatingTablePage$(Physics.CPM, page)
            .pipe(
                take(1),
                finalize(() => (this.isLoadingCpm = false)),
            )
            .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
    }
}
