import { Physics } from '../../enums/physics.enum';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CupPageTypes } from './enums/cup-page-types.enum';
import { CupTableService } from './services/cup-table.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { MulticupRoundInterface } from './interfaces/multicup-round.interface';
import { MulticupTableInterface } from './interfaces/multicup-table.interface';

@Component({
    selector: 'app-cup-page',
    templateUrl: './cup.page.component.html',
    styleUrls: ['./cup.page.component.less'],
})
export class CupPageComponent implements OnInit, OnDestroy {
    public type: CupPageTypes;
    public isRound: boolean;
    public fullTable$ = new ReplaySubject<MulticupTableInterface>(1);
    public round$ = new ReplaySubject<MulticupRoundInterface>(1);

    private onDestroy$ = new Subject<void>();

    constructor(private activatedRoute: ActivatedRoute, private cupTableService: CupTableService) {
        this.type = this.activatedRoute.snapshot.params.type;
    }

    ngOnInit(): void {
        this.initSubscriptions();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private initSubscriptions(): void {
        this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(({ id, physics, round }: Params) => {
            if (id && !round) {
                this.isRound = false;
                this.getFullTable(id, physics);
            }

            if (id && round) {
                this.isRound = true;
                this.getRound(id, round, physics);
            }
        });
    }

    private getFullTable(id: string, physics: Physics): void {
        if (this.type === CupPageTypes.MULTICUP) {
            this.cupTableService
                .getMultiCupFullTable$(id, physics)
                .pipe(take(1))
                .subscribe((table: MulticupTableInterface) => this.fullTable$.next(table));
        }

        if (this.type === CupPageTypes.ONLINE) {
            this.cupTableService
                .getOnlineCupFullTable$(id)
                .pipe(take(1))
                .subscribe((table: MulticupTableInterface) => this.fullTable$.next(table));
        }
    }

    private getRound(id: string, round: string, physics: Physics): void {
        if (this.type === CupPageTypes.MULTICUP) {
            this.cupTableService
                .getMultiCupRoundTable$(id, physics, round)
                .pipe(take(1))
                .subscribe((table: MulticupRoundInterface) => this.round$.next(table));
        }

        if (this.type === CupPageTypes.ONLINE) {
            this.cupTableService
                .getOnlineCupRoundTable$(id, round)
                .pipe(take(1))
                .subscribe((table: MulticupRoundInterface) => this.round$.next(table));
        }
    }
}
