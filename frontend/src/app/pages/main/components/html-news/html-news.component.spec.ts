import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HtmlNewsComponent } from './html-news.component';

describe('HtmlNewsComponent', () => {
    let component: HtmlNewsComponent;
    let fixture: ComponentFixture<HtmlNewsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HtmlNewsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HtmlNewsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
