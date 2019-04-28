import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-cup-timer-offline-awaiting',
    templateUrl: './cup-timer-offline-awaiting.component.html'
})
export class CupTimerOfflineAwaitingComponent {
    @Input()
    cupName: string;
    @Input()
    startTime: number;
    @Input()
    currentTime: number;
}
