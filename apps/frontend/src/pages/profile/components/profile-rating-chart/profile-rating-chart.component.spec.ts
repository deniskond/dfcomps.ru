import { Physics } from '../../../../enums/physics.enum';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileRatingChartComponent } from './profile-rating-chart.component';
import { ChartsModule } from 'ng2-charts';

describe('ProfileRatingChartComponent', () => {
  let component: ProfileRatingChartComponent;
  let fixture: ComponentFixture<ProfileRatingChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ChartsModule],
      declarations: [ProfileRatingChartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileRatingChartComponent);
    component = fixture.componentInstance;
    component.chart = [];
    component.physics = Physics.CPM;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
