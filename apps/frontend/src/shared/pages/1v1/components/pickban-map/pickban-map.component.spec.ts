import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PickbanMapComponent } from './pickban-map.component';

describe('PickbanMapComponent', () => {
  let component: PickbanMapComponent;
  let fixture: ComponentFixture<PickbanMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PickbanMapComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickbanMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
