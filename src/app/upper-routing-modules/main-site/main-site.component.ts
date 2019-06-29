import { CupsService } from '../../services/cups/cups.service';
import { CupInterface } from '../../interfaces/cup.interface';
import { Physics } from '../../enums/physics.enum';
import { CupTypes } from '../../enums/cup-types.enum';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
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

    // TODO [DFRU-21] Оффлайн капы
    // TODO [DFRU-22] Онлайн капы
    // public startTime = moment()
    //     .add(100, 'seconds')
    //     .unix();
    // public endTime = moment()
    //     .add(200, 'seconds')
    //     .unix();
}
