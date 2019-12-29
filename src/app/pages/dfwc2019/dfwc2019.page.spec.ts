import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Dfwc2019PageComponent } from './dfwc2019.page';
import { Dfwc2019PageModule } from './dfwc2019.page.module';

describe('Dfwc2019PageComponent', () => {
    let component: Dfwc2019PageComponent;
    let fixture: ComponentFixture<Dfwc2019PageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [Dfwc2019PageModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Dfwc2019PageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
