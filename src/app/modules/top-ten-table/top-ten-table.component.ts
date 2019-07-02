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
    public hoveredCells: boolean[] = [];

    ngOnInit(): void {
        this.topTenTable$ = this.ratingTablesService.getTop10Table$(this.physics);
    }
}
