import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsDfwcResultsComponent } from './news-dfwc-results.component';

describe('NewsDfwcResultsComponent', () => {
  let component: NewsDfwcResultsComponent;
  let fixture: ComponentFixture<NewsDfwcResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsDfwcResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsDfwcResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
