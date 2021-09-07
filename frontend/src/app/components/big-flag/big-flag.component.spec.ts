import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BigFlagComponent } from './big-flag.component';

describe('BigFlagComponent', () => {
    let component: BigFlagComponent;
    let fixture: ComponentFixture<BigFlagComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [BigFlagComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BigFlagComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
