import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { CupTimerOfflineAwaitingComponent } from './cup-timer-offline-awaiting.component';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';

describe('CupTimerOfflineAwaitingComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerOfflineAwaitingComponent, CountdownTimerComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CupTimerOfflineAwaitingComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
