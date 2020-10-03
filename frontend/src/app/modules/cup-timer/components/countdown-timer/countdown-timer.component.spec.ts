import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { CountdownTimerComponent } from './countdown-timer.component';

describe('CountdownTimerComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CountdownTimerComponent],
        }).compileComponents();
    }));

    it('should create', fakeAsync(() => {
        const fixture = TestBed.createComponent(CountdownTimerComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
