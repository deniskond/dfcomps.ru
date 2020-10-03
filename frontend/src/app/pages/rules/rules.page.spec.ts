import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RulesPageComponent } from './rules.page';

describe('RulesPageComponent', () => {
    let component: RulesPageComponent;
    let fixture: ComponentFixture<RulesPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RulesPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RulesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
