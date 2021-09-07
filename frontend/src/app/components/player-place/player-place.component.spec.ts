import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayerPlaceComponent } from './player-place.component';

describe('PlayerPlaceComponent', () => {
  let component: PlayerPlaceComponent;
  let fixture: ComponentFixture<PlayerPlaceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerPlaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
