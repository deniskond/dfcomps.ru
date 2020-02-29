import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReflexInvalidDemosListComponent } from './reflex-invalid-demos-list.component';

describe('ReflexInvalidDemosListComponent', () => {
    let component: ReflexInvalidDemosListComponent;
    let fixture: ComponentFixture<ReflexInvalidDemosListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReflexInvalidDemosListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReflexInvalidDemosListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
