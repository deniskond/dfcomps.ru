import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Physics } from '../../enums/physics.enum';
import { Component, Input, OnInit } from '@angular/core';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Observable } from 'rxjs';
import {
    hoverableCellAnimation,
    HOVERABLE_CELL_HOVERED_STATE,
    HOVERABLE_CELL_NORMAL_STATE,
} from './animations/hoverable-cell.animation';
import { Router } from '@angular/router';

// TODO [DFRU-4] Оформить в модуль
@Component({
    selector: 'app-top-ten-table',
    templateUrl: './top-ten-table.component.html',
    styleUrls: ['./top-ten-table.component.less'],
    animations: [hoverableCellAnimation],
})
export class TopTenTableComponent implements OnInit {
    @Input()
    physics: Physics;

    constructor(private ratingTablesService: RatingTablesService, private router: Router) {}

    public topTenTable$: Observable<LeaderTableInterface[]>;
    public hoveredCells: boolean[] = [];

    ngOnInit(): void {
        this.topTenTable$ = this.ratingTablesService.getTop10Table$(this.physics);
    }

    public darkenPlayerRow({ position }: LeaderTableInterface): void {
        this.hoveredCells[position] = true;
    }

    public lightenPlayerRow({ position }: LeaderTableInterface): void {
        this.hoveredCells[position] = false;
    }

    public getHoveredState({ position }: LeaderTableInterface): string {
        return !!this.hoveredCells[position] ? HOVERABLE_CELL_HOVERED_STATE : HOVERABLE_CELL_NORMAL_STATE;
    }

    public navigateToPlayerProfile(playerId: number): void {
        this.router.navigate([`/profile/${playerId}`]);
    }
}
