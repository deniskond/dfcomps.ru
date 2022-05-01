import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SDCRulesDialogComponent } from './sdc-rules-dialog.component';

describe('SDCRulesDialogComponent', () => {
  let component: SDCRulesDialogComponent;
  let fixture: ComponentFixture<SDCRulesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SDCRulesDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SDCRulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
