import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOnlineComponent } from './cup-timer-online.component';

describe('CupTimerOnlineComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CupTimerOnlineComponent],
    }).compileComponents();
  }));

  it('should create', fakeAsync(() => {
    const fixture = TestBed.createComponent(CupTimerOnlineComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
