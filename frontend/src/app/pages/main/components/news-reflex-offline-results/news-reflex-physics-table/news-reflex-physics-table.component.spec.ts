import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsReflexPhysicsTableComponent } from './news-reflex-physics-table.component';

describe('NewsReflexPhysicsTableComponent', () => {
    let component: NewsReflexPhysicsTableComponent;
    let fixture: ComponentFixture<NewsReflexPhysicsTableComponent>;

    beforeEach(async(() => {
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
