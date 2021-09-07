import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsOnlineAnnounceComponent } from './news-online-announce.component';

describe('NewsOnlineAnnounceComponent', () => {
    let component: NewsOnlineAnnounceComponent;
    let fixture: ComponentFixture<NewsOnlineAnnounceComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsOnlineAnnounceComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsOnlineAnnounceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
