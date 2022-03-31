import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GmtDateTimeComponent } from './gmt-date-time.component';

describe('GmtDateTimeComponent', () => {
  let component: GmtDateTimeComponent;
  let fixture: ComponentFixture<GmtDateTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GmtDateTimeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GmtDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
