import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewsReflexPhysicsTableComponent } from './news-reflex-physics-table.component';

describe('NewsReflexPhysicsTableComponent', () => {
    let component: NewsReflexPhysicsTableComponent;
    let fixture: ComponentFixture<NewsReflexPhysicsTableComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsReflexPhysicsTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsReflexPhysicsTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
