import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatchProgressComponent } from './match-progress.component';

describe('MatchProgressComponent', () => {
  let component: MatchProgressComponent;
  let fixture: ComponentFixture<MatchProgressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MatchProgressComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
