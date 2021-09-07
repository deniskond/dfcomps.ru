import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOfflineFinishedComponent } from './cup-timer-offline-finished.component';

describe('CupTimerOfflineFinishedComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerOfflineFinishedComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CupTimerOfflineFinishedComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
