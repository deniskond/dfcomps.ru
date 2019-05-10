import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCupsTableComponent } from './profile-cups-table.component';

describe('ProfileCupsTableComponent', () => {
    let component: ProfileCupsTableComponent;
    let fixture: ComponentFixture<ProfileCupsTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
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
