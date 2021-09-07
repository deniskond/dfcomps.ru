import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WeaponsComponent } from './weapons.component';

describe('WeaponsComponent', () => {
    let component: WeaponsComponent;
    let fixture: ComponentFixture<WeaponsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WeaponsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WeaponsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
