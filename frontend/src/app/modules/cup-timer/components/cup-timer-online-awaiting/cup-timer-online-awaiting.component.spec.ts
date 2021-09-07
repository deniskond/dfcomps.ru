import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOnlineAwaitingComponent } from './cup-timer-online-awaiting.component';

describe('CupTimerOnlineAwaitingComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerOnlineAwaitingComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CupTimerOnlineAwaitingComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
