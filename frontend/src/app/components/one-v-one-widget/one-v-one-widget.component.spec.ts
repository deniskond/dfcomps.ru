import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneVOneWidgetComponent } from './one-v-one-widget.component';

describe('OneVOneWidgetComponent', () => {
  let component: OneVOneWidgetComponent;
  let fixture: ComponentFixture<OneVOneWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneVOneWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneVOneWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
