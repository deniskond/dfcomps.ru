import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOnlineProgressComponent } from './cup-timer-online-progress.component';

describe('CupTimerOnlineProgressComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerOnlineProgressComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CupTimerOnlineProgressComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
