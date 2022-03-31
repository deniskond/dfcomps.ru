import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayerDemosDialogComponent } from './player-demos-dialog.component';

describe('PlayerDemosDialogComponent', () => {
  let component: PlayerDemosDialogComponent;
  let fixture: ComponentFixture<PlayerDemosDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerDemosDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerDemosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
