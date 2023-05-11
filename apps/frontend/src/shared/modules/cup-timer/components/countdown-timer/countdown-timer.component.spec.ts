import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CountdownTimerComponent } from './countdown-timer.component';

describe('CountdownTimerComponent', () => {
  beforeEach(waitForAsync(() => {
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
