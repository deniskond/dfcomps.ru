import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SmilesDropdownComponent } from './smiles-dropdown.component';

describe('SmilesDropdownComponent', () => {
    let component: SmilesDropdownComponent;
    let fixture: ComponentFixture<SmilesDropdownComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SmilesDropdownComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SmilesDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
