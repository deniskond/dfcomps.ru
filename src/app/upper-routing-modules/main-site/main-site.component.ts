import { CupsService } from '../../services/cups/cups.service';
import { CupInterface } from '../../interfaces/cup.interface';
import { Physics } from '../../enums/physics.enum';
import { CupTypes } from '../../enums/cup-types.enum';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    templateUrl: './main-site.component.html',
    styleUrls: ['./main-site.component.less'],
})
export class MainSiteComponent implements OnInit {
    public cupTypes = CupTypes;
    public physics = Physics;
    public nextCupInfo$: Observable<CupInterface>;

    constructor(private cupsService: CupsService) {}

    ngOnInit(): void {
        this.nextCupInfo$ = this.cupsService.getNextCupInfo$();
    }
}
