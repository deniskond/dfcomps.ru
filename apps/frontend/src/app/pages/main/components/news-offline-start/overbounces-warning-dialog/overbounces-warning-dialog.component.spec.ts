import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverbouncesWarningDialogComponent } from './overbounces-warning-dialog.component';

describe('OverbouncesWarningDialogComponent', () => {
  let component: OverbouncesWarningDialogComponent;
  let fixture: ComponentFixture<OverbouncesWarningDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OverbouncesWarningDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverbouncesWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
