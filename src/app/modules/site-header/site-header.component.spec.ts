import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SiteHeaderComponent } from './site-header.component';
import { SiteHeaderModule } from './site-header.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('SiteHeaderComponent', () => {
    let component: SiteHeaderComponent;
    let fixture: ComponentFixture<SiteHeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [SiteHeaderModule, RouterTestingModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SiteHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
