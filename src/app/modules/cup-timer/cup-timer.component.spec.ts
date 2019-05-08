import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CupTimerComponent } from './cup-timer.component';
import { CupTimerModule } from './cup-timer.module';

describe('CupTimerComponent', () => {
    let component: CupTimerComponent;
    let fixture: ComponentFixture<CupTimerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [CupTimerModule],
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
