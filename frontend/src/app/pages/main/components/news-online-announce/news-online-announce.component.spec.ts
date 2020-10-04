import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsOnlineAnnounceComponent } from './news-online-announce.component';

describe('NewsOnlineAnnounceComponent', () => {
    let component: NewsOnlineAnnounceComponent;
    let fixture: ComponentFixture<NewsOnlineAnnounceComponent>;

    beforeEach(async(() => {
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
