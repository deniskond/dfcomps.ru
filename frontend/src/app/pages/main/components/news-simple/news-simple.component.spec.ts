import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsSimpleComponent } from './news-simple.component';

describe('NewsSimpleComponent', () => {
    let component: NewsSimpleComponent;
    let fixture: ComponentFixture<NewsSimpleComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsSimpleComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsSimpleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
