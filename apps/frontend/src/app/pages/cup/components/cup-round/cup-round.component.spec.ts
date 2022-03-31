import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CupRoundComponent } from './cup-round.component';

describe('CupRoundComponent', () => {
  let component: CupRoundComponent;
  let fixture: ComponentFixture<CupRoundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CupRoundComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CupRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
