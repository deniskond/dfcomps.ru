import { LanguageService } from '../../../../../services/language/language.service';
import { Translations } from '../../../../../components/translations/translations.component';
import { MulticupResultInterface } from '../../../../../interfaces/multicup-result.interface';
import { Component, Input, OnInit } from '@angular/core';
import { Physics } from '../../../../../enums/physics.enum';
import { getTablePlaces } from '../../../../../helpers/table-places.helper';

@Component({
    selector: 'app-multicup-physics-table',
    templateUrl: './multicup-physics-table.component.html',
    styleUrls: ['./multicup-physics-table.component.less'],
})
export class MulticupPhysicsTableComponent extends Translations implements OnInit {
    @Input() physics: Physics;
    @Input() physicsTable: MulticupResultInterface[];
    @Input() multicupId: string;

    public slicedPhysicsTable: MulticupResultInterface[];
    public places: number[];

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.slicedPhysicsTable = this.physicsTable.slice(0, 10);
        this.places = getTablePlaces(this.slicedPhysicsTable.map(({ sum }: MulticupResultInterface) => sum));
        super.ngOnInit();
    }
}
