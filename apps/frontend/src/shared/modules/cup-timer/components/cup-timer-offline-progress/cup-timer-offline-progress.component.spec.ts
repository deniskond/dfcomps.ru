import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOfflineProgressComponent } from './cup-timer-offline-progress.component';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';

describe('CupTimerOfflineProgressComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CupTimerOfflineProgressComponent, CountdownTimerComponent],
    }).compileComponents();
  }));

  it('should create', fakeAsync(() => {
    const fixture = TestBed.createComponent(CupTimerOfflineProgressComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
