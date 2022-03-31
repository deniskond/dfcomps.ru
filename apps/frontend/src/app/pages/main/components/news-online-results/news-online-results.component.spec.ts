import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsOnlineResultsComponent } from './news-online-results.component';

describe('NewsOnlineResultsComponent', () => {
  let component: NewsOnlineResultsComponent;
  let fixture: ComponentFixture<NewsOnlineResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NewsOnlineResultsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsOnlineResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
