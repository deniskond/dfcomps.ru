import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CupFullTableComponent } from './cup-full-table.component';

describe('CupFullTableComponent', () => {
    let component: CupFullTableComponent;
    let fixture: ComponentFixture<CupFullTableComponent>;

    beforeEach(async(() => {
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
