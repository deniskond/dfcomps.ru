import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TopTenTableComponent } from './top-ten-table.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TopTenTableModule } from './top-ten-table.module';
import { instance, mock } from 'ts-mockito';

describe('TopTenTableComponent', () => {
  let component: TopTenTableComponent;
  let fixture: ComponentFixture<TopTenTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TopTenTableModule, RouterTestingModule],
      providers: [{ provide: RatingTablesService, useFactory: () => instance(mock(RatingTablesService)) }],
    }).compileComponents();
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
