import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReflexComponent } from './reflex.component';

describe('ReflexComponent', () => {
    let component: ReflexComponent;
    let fixture: ComponentFixture<ReflexComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReflexComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReflexComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
