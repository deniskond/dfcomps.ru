import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRatingChartComponent } from './profile-rating-chart.component';

describe('ProfileRatingChartComponent', () => {
    let component: ProfileRatingChartComponent;
    let fixture: ComponentFixture<ProfileRatingChartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProfileRatingChartComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileRatingChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
