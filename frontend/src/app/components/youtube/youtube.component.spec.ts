import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { YoutubeComponent } from './youtube.component';

describe('YoutubeComponent', () => {
    let component: YoutubeComponent;
    let fixture: ComponentFixture<YoutubeComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [YoutubeComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(YoutubeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
