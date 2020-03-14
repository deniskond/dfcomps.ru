import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-gmt-date-time',
    templateUrl: './gmt-date-time.component.html',
    styleUrls: ['./gmt-date-time.component.less'],
})
export class GmtDateTimeComponent implements OnInit {
    @Input()
    dateTime: string;

    public formattedDateTime: string;

    ngOnInit(): void {
        this.formattedDateTime = moment(this.dateTime).format('DD.MM.YYYY HH:mm');
    }
}
