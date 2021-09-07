import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatchProgressTimerComponent } from './match-progress-timer.component';

describe('MatchProgressTimerComponent', () => {
    let component: MatchProgressTimerComponent;
    let fixture: ComponentFixture<MatchProgressTimerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MatchProgressTimerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MatchProgressTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
