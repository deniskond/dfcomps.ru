import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsOfflineResultsComponent } from './news-offline-results.component';

describe('NewsOfflineResultsComponent', () => {
    let component: NewsOfflineResultsComponent;
    let fixture: ComponentFixture<NewsOfflineResultsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsOfflineResultsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsOfflineResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
