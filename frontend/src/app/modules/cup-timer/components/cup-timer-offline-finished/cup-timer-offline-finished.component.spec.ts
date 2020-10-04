import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { CupTimerOfflineFinishedComponent } from './cup-timer-offline-finished.component';

describe('CupTimerOfflineFinishedComponent', () => {
    beforeEach(async(() => {
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
