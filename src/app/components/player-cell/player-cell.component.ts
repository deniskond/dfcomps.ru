import { Component, Input } from '@angular/core';
import {
    hoverableCellAnimation,
    HOVERABLE_CELL_HOVERED_STATE,
    HOVERABLE_CELL_NORMAL_STATE,
} from './animations/hoverable-cell.animation';
import { Router } from '@angular/router';

@Component({
    selector: 'app-player-cell',
    templateUrl: './player-cell.component.html',
    styleUrls: ['./player-cell.component.less'],
    animations: [hoverableCellAnimation],
})
export class PlayerCellComponent {
    @Input() country: string;
    @Input() nick: string;
    @Input() playerId: string;

    constructor(private router: Router) {}

    public hovered = false;

    public darkenPlayerRow(): void {
        this.hovered = true;
    }

    public lightenPlayerRow(): void {
        this.hovered = false;
    }

    public getHoveredState(): string {
        return this.hovered ? HOVERABLE_CELL_HOVERED_STATE : HOVERABLE_CELL_NORMAL_STATE;
    }

    public navigateToPlayerProfile(playerId: string): void {
        this.router.navigate([`/profile/${playerId}`]);
    }
}
