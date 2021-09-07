import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsMulticupResultsComponent } from './news-multicup-results.component';

describe('NewsMulticupResultsComponent', () => {
    let component: NewsMulticupResultsComponent;
    let fixture: ComponentFixture<NewsMulticupResultsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsMulticupResultsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsMulticupResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
