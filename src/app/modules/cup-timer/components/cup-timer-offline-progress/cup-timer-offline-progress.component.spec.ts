import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { CupTimerOfflineProgressComponent } from './cup-timer-offline-progress.component';

describe('CupTimerOfflineProgressComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerOfflineProgressComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CupTimerOfflineProgressComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
