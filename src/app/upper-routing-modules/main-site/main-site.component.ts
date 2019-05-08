import { Physics } from '../../enums/physics.enum';
import { CupTypes } from '../../enums/cup-types.enum';
import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
    templateUrl: './main-site.component.html',
    styleUrls: ['./main-site.component.less']
})
export class MainSiteComponent {
    public cupTypes = CupTypes;
    public physics = Physics;

    // TODO [DFRU-21] Оффлайн капы
    // TODO [DFRU-22] Онлайн капы
    public startTime = moment().add(10, 'seconds').unix();
    public endTime = moment().add(20, 'seconds').unix();
}
