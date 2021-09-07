import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CupFullTableComponent } from './cup-full-table.component';

describe('CupFullTableComponent', () => {
    let component: CupFullTableComponent;
    let fixture: ComponentFixture<CupFullTableComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CupFullTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CupFullTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
