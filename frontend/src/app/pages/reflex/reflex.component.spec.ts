import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReflexComponent } from './reflex.component';

describe('ReflexComponent', () => {
    let component: ReflexComponent;
    let fixture: ComponentFixture<ReflexComponent>;

    beforeEach(waitForAsync(() => {
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
