import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageTranslationsComponent } from './language-translations.component';

describe('LanguageTranslationsComponent', () => {
    let component: LanguageTranslationsComponent;
    let fixture: ComponentFixture<LanguageTranslationsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LanguageTranslationsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LanguageTranslationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
