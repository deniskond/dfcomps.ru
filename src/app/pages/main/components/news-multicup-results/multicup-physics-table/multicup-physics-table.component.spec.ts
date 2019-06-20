import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MulticupPhysicsTableComponent } from './multicup-physics-table.component';

describe('MulticupPhysicsTableComponent', () => {
    let component: MulticupPhysicsTableComponent;
    let fixture: ComponentFixture<MulticupPhysicsTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MulticupPhysicsTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MulticupPhysicsTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
