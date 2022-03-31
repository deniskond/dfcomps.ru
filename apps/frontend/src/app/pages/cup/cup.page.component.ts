import { Physics } from '../../enums/physics.enum';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CupPageTypes } from './enums/cup-page-types.enum';
import { CupTableService } from './services/cup-table.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { MulticupRoundInterface } from './interfaces/multicup-round.interface';
import { MulticupTableInterface } from './interfaces/multicup-table.interface';

@Component({
  selector: 'app-cup-page',
  templateUrl: './cup.page.component.html',
  styleUrls: ['./cup.page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupPageComponent implements OnInit, OnDestroy {
  public type: CupPageTypes;
  public isRound: boolean;
  public fullTable$ = new ReplaySubject<MulticupTableInterface>(1);
  public round$ = new ReplaySubject<MulticupRoundInterface>(1);
  public roundNumber: number;

  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cupTableService: CupTableService,
  ) {
    this.type = this.activatedRoute.snapshot.params['type'];
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public navigateToRound(round: number): void {
    const splitUrl: string[] = this.router.url.split('?');
    const mainUrl: string = splitUrl[0];
    const queryParams: Record<string, string> = splitUrl[1]
      .split('&')
      .reduce((acc: Record<string, string>, urlPart: string) => {
        const urlPartSplit = urlPart.split('=');

        return { ...acc, [urlPartSplit[0]]: urlPartSplit[1] };
      }, {});

    queryParams['round'] = round.toString();

    this.router.navigate([mainUrl], { queryParams });
  }

  private initSubscriptions(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(({ id, physics, round }: Params) => {
      if (id && !round) {
        this.isRound = false;
        this.getFullTable(id, physics);
      }

      if (id && round) {
        this.isRound = true;
        this.roundNumber = round;
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
        .pipe(
          take(1),
          map((cupTable: MulticupTableInterface) => ({ ...cupTable, currentRound: +cupTable.currentRound })),
        )
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
