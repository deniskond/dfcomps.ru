import { SharedModule } from '../../../../modules/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileCupsTableComponent } from './profile-cups-table.component';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';

describe('ProfileCupsTableComponent', () => {
    let component: ProfileCupsTableComponent;
    let fixture: ComponentFixture<ProfileCupsTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatTableModule, SharedModule, CdkTableModule],
            declarations: [ProfileCupsTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileCupsTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
