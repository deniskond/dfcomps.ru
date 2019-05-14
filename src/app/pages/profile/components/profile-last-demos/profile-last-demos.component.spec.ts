import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileLastDemosComponent } from './profile-last-demos.component';

describe('ProfileLastDemosComponent', () => {
    let component: ProfileLastDemosComponent;
    let fixture: ComponentFixture<ProfileLastDemosComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
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
