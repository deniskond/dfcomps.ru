import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Physics } from '../../../../../enums/physics.enum';
import { getTablePlaces } from '../../../../../helpers/table-places.helper';
import { Router } from '@angular/router';
import { MulticupResultInterface } from '../../../../../pages/cup/interfaces/multicup-result.interface';

@Component({
    selector: 'app-multicup-physics-table',
    templateUrl: './multicup-physics-table.component.html',
    styleUrls: ['./multicup-physics-table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MulticupPhysicsTableComponent implements OnInit {
    @Input() physics: Physics;
    @Input() physicsTable: MulticupResultInterface[];
    @Input() multicupId: string;

    public slicedPhysicsTable: MulticupResultInterface[];
    public places: number[];

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.slicedPhysicsTable = this.physicsTable.slice(0, 10);
        this.places = getTablePlaces(this.slicedPhysicsTable.map(({ overall }: MulticupResultInterface) => overall));
    }

    public navigateToMultiCup(): void {
        this.router.navigate(['cup/multi'], { queryParams: { id: this.multicupId, physics: this.physics } });
    }
}
