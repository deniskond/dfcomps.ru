import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsOnlineResultsComponent } from './news-online-results.component';

describe('NewsOnlineResultsComponent', () => {
    let component: NewsOnlineResultsComponent;
    let fixture: ComponentFixture<NewsOnlineResultsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NewsOnlineResultsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsOnlineResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
