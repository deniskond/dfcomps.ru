import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTenTableComponent } from './top-ten-table.component';

describe('TopTenTableComponent', () => {
  let component: TopTenTableComponent;
  let fixture: ComponentFixture<TopTenTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopTenTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopTenTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
