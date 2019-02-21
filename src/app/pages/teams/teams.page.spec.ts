import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamsPageComponent } from './teams.page';

describe('TeamsPageComponent', () => {
    let component: TeamsPageComponent;
    let fixture: ComponentFixture<TeamsPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamsPageComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
