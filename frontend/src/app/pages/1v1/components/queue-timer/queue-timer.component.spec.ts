import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueTimerComponent } from './queue-timer.component';

describe('QueueTimerComponent', () => {
    let component: QueueTimerComponent;
    let fixture: ComponentFixture<QueueTimerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [QueueTimerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QueueTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
