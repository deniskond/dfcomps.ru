import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-cup-timer-offline-progress',
    templateUrl: './cup-timer-offline-progress.component.html'
})
export class CupTimerOfflineProgressComponent {
    @Input()
    cupName: string;
    @Input()
    newsId: string;
    @Input()
    mapLink: string;
    @Input()
    endTime: number;
    @Input()
    currentTime: number;
}
