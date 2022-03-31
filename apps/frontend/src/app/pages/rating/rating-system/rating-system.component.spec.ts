import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RatingSystemComponent } from './rating-system.component';

describe('RatingSystemComponent', () => {
  let component: RatingSystemComponent;
  let fixture: ComponentFixture<RatingSystemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RatingSystemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
