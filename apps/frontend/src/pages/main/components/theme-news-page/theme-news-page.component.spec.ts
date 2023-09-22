import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeNewsPageComponent } from './theme-news-page.component';

describe('ThemeNewsPageComponent', () => {
  let component: ThemeNewsPageComponent;
  let fixture: ComponentFixture<ThemeNewsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeNewsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeNewsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
