import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddMulticupRoundComponent } from './admin-add-multicup-round.component';

describe('AdminAddMulticupRoundComponent', () => {
  let component: AdminAddMulticupRoundComponent;
  let fixture: ComponentFixture<AdminAddMulticupRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddMulticupRoundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddMulticupRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
