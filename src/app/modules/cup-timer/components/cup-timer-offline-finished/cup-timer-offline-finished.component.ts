import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-cup-timer-offline-finished',
    templateUrl: './cup-timer-offline-finished.component.html'
})
export class CupTimerOfflineFinishedComponent {
    @Input()
    cupName: string;
    @Input()
    newsId: number;
    @Input()
    mapLink: string;
}
