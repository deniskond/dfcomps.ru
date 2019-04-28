import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { CupTimerOfflineComponent } from './cup-timer-offline.component';

describe('CupTimerOfflineComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerOfflineComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CupTimerOfflineComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
