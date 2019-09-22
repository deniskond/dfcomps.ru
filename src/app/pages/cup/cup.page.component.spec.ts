import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CupPageComponent } from './cup.page.component';

describe('CupPageComponent', () => {
    let component: CupPageComponent;
    let fixture: ComponentFixture<CupPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CupPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CupPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
