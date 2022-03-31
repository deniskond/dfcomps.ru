import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CupTimerOfflineComponent } from './cup-timer-offline.component';
import { CupTimerModule } from '../../cup-timer.module';

describe('CupTimerOfflineComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CupTimerModule],
    }).compileComponents();
  }));

  it('should create', fakeAsync(() => {
    const fixture = TestBed.createComponent(CupTimerOfflineComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
