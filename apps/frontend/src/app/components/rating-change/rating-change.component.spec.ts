import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RatingChangeComponent } from './rating-change.component';

describe('RatingChangeComponent', () => {
  let component: RatingChangeComponent;
  let fixture: ComponentFixture<RatingChangeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RatingChangeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
