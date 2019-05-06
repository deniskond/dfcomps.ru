import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Physics } from '../../enums/physics.enum';
import { Component, Input, OnInit } from '@angular/core';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-top-ten-table',
    templateUrl: './top-ten-table.component.html',
    styleUrls: ['./top-ten-table.component.less'],
})
export class TopTenTableComponent implements OnInit {
    @Input()
    physics: Physics;

    constructor(private ratingTablesService: RatingTablesService) {}

    public topTenTable$: Observable<LeaderTableInterface[]>;
    public hovered = [];

    ngOnInit(): void {
        this.topTenTable$ = this.ratingTablesService.getTop10Table$(this.physics);
    }

    public darkenPlayerRow(row): void {
        this.hovered[row.position] = true;
    }

    public lightenPlayerRow(row): void {
        this.hovered[row.position] = false;
    }

    public isHovered(row: any): boolean {
        console.warn(!!this.hovered[row.position]);

        return !!this.hovered[row.position];
    }
}
