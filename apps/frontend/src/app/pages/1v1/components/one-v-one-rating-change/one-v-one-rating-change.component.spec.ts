import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneVOneRatingChangeComponent } from './one-v-one-rating-change.component';

describe('OneVOneRatingChangeComponent', () => {
  let component: OneVOneRatingChangeComponent;
  let fixture: ComponentFixture<OneVOneRatingChangeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OneVOneRatingChangeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneVOneRatingChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
