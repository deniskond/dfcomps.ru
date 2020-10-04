import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsOfflineStartComponent } from './news-offline-start.component';

describe('NewsOfflineStartComponent', () => {
    let component: NewsOfflineStartComponent;
    let fixture: ComponentFixture<NewsOfflineStartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NewsOfflineStartComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsOfflineStartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
