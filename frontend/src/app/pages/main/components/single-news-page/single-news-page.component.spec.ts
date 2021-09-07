import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SingleNewsPageComponent } from './single-news-page.component';

describe('SingleNewsPageComponent', () => {
    let component: SingleNewsPageComponent;
    let fixture: ComponentFixture<SingleNewsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SingleNewsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleNewsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
