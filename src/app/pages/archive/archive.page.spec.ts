import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchivePageComponent } from './archive.page';

describe('ArchivePageComponent', () => {
    let component: ArchivePageComponent;
    let fixture: ComponentFixture<ArchivePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ArchivePageComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ArchivePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
