import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewsSocialLinksComponent } from './news-social-links.component';

describe('NewsSocialLinksComponent', () => {
    let component: NewsSocialLinksComponent;
    let fixture: ComponentFixture<NewsSocialLinksComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NewsSocialLinksComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewsSocialLinksComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
