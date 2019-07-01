import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-players-rating-table',
    templateUrl: './players-rating-table.component.html',
    styleUrls: ['./players-rating-table.component.less'],
})
export class PlayersRatingTableComponent {
    @Input() ratingTable: LeaderTableInterface[];
}
