import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InvalidDemosListComponent } from './invalid-demos-list.component';

describe('InvalidDemosListComponent', () => {
    let component: InvalidDemosListComponent;
    let fixture: ComponentFixture<InvalidDemosListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InvalidDemosListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvalidDemosListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
