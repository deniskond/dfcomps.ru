import { Component, OnInit, Input } from '@angular/core';
import { CupTimerTypes } from './enums/cup-timer-types.enum';
import { BackendService } from '../../services/backend-service';
import { CupTimerService } from './services/cup-timer.service';

@Component({
    selector: 'app-cup-timer',
    templateUrl: './cup-timer.component.html',
    styleUrls: ['./cup-timer.component.less'],
    providers: [CupTimerService],
})
export class CupTimerComponent implements OnInit {
    @Input()
    cupName: string;
    @Input()
    cupType: CupTimerTypes;
    @Input()
    startTime: number;
    @Input()
    endTime: number;
    @Input()
    mapLink: string;
    @Input()
    newsId: string;

    constructor(private backendService: BackendService) {}

    ngOnInit(): void {
        // this.backendService.test().subscribe(val => { debugger; });
    }
}
