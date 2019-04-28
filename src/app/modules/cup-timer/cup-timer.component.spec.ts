import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CupTimerComponent } from './cup-timer.component';

describe('CupTimerComponent', () => {
    let component: CupTimerComponent;
    let fixture: ComponentFixture<CupTimerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CupTimerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CupTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
