import { Translations } from '../../components/translations/translations.component';
import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Physics } from '../../enums/physics.enum';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LeaderTableInterface } from '../../interfaces/leader-table.interface';
import { Observable } from 'rxjs';
import { LanguageService } from '../../services/language/language.service';

@Component({
    selector: 'app-top-ten-table',
    templateUrl: './top-ten-table.component.html',
    styleUrls: ['./top-ten-table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopTenTableComponent extends Translations implements OnInit {
    @Input()
    physics: Physics;

    constructor(private ratingTablesService: RatingTablesService, protected languageService: LanguageService) {
        super(languageService);
    }

    public topTenTable$: Observable<LeaderTableInterface[]>;
    public hoveredCells: boolean[] = [];

    ngOnInit(): void {
        this.topTenTable$ = this.ratingTablesService.getTop10Table$(this.physics);
        super.ngOnInit();
    }
}
