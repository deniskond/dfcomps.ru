import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayersRatingTableComponent } from './players-rating-table.component';

describe('PlayersRatingTableComponent', () => {
  let component: PlayersRatingTableComponent;
  let fixture: ComponentFixture<PlayersRatingTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlayersRatingTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayersRatingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
