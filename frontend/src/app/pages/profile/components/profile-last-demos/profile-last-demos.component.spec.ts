import { CdkTableModule } from '@angular/cdk/table';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileLastDemosComponent } from './profile-last-demos.component';
import { MatTableModule } from '@angular/material/table';

describe('ProfileLastDemosComponent', () => {
    let component: ProfileLastDemosComponent;
    let fixture: ComponentFixture<ProfileLastDemosComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [MatTableModule, CdkTableModule],
            declarations: [ProfileLastDemosComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileLastDemosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
