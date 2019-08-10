import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadDfDialogComponent } from './download-df-dialog.component';

describe('DownloadDfDialogComponent', () => {
    let component: DownloadDfDialogComponent;
    let fixture: ComponentFixture<DownloadDfDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DownloadDfDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DownloadDfDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
