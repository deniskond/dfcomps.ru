import { CdkTableModule } from '@angular/cdk/table';
import { SharedModule } from '../../modules/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePageComponent } from './profile.page';
import { ProfileRatingChartComponent } from './components/profile-rating-chart/profile-rating-chart.component';
import { ProfileRewardsComponent } from './components/profile-rewards/profile-rewards.component';
import { ProfileCupsTableComponent } from './components/profile-cups-table/profile-cups-table.component';
import { ProfileLastDemosComponent } from './components/profile-last-demos/profile-last-demos.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { mock, instance } from 'ts-mockito';
import { ProfileService } from './services/profile.service';

describe('ProfilePageComponent', () => {
    let component: ProfilePageComponent;
    let fixture: ComponentFixture<ProfilePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                MatProgressSpinnerModule,
                ChartsModule,
                MatTooltipModule,
                MatTableModule,
                CdkTableModule,
            ],
            declarations: [
                ProfilePageComponent,
                ProfileRatingChartComponent,
                ProfileRewardsComponent,
                ProfileCupsTableComponent,
                ProfileLastDemosComponent,
            ],
            providers: [
                { provide: ActivatedRoute, useFactory: () => instance(mock(ActivatedRoute)) },
                { provide: ProfileService, useFactory: () => instance(mock(ProfileService)) },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfilePageComponent);
        component = fixture.componentInstance;
        component.setRouteSubscription = () => {};
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
