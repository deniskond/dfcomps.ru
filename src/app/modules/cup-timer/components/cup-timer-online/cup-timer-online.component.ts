import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-cup-timer-online',
    templateUrl: './cup-timer-online.component.html',
})
export class CupTimerOnlineComponent {
    @Input()
    cupName: string;
    @Input()
    startTime: number;
    @Input()
    endTime: number;
    @Input()
    currentTime: number;
    @Input()
    newsId: string;
}
