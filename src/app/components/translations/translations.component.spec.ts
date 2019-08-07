import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Translations } from './translations.component';

describe('Translations', () => {
    let component: Translations;
    let fixture: ComponentFixture<Translations>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Translations],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Translations);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
