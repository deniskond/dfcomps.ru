import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RatingPageComponent } from './rating.page';

describe('RatingPageComponent', () => {
    let component: RatingPageComponent;
    let fixture: ComponentFixture<RatingPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [RatingPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RatingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
