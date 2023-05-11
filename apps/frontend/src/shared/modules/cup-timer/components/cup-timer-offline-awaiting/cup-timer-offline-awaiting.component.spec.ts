import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOfflineAwaitingComponent } from './cup-timer-offline-awaiting.component';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';

describe('CupTimerOfflineAwaitingComponent', () => {
  beforeEach(waitForAsync(() => {
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
