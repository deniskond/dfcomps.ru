import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdminDeleteCommentDialogComponent } from './admin-delete-comment-dialog.component';

describe('AdminDeleteCommentDialog', () => {
    let component: AdminDeleteCommentDialogComponent;
    let fixture: ComponentFixture<AdminDeleteCommentDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AdminDeleteCommentDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDeleteCommentDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
