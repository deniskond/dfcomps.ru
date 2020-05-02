import { CommentActionResult } from './../../services/comments/enums/comment-action-result.enum';
import { UserAccess } from '../../../../enums/user-access.enum';
import { CommentWithActionInterface } from './interfaces/comment-with-action.interface';
import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { UserInterface } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user-service/user.service';
import { CommentInterface } from '../../../../interfaces/comments.interface';
import {
    Component,
    Input,
    ViewChild,
    ElementRef,
    OnChanges,
    SimpleChanges,
    OnInit,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommentsService } from '../../services/comments/comments.service';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { take, finalize, map, catchError, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { CommentActionResultInterface } from '../../services/comments/interfaces/comment-action.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminDeleteCommentDialogComponent } from './components/admin-delete-comment-dialog/admin-delete-comment-dialog.component';

const COMMENT_ACTION_PERIOD_MINUTES = 2;

@Component({
    selector: 'app-news-comments',
    templateUrl: './news-comments.component.html',
    styleUrls: ['./news-comments.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsCommentsComponent extends Translations implements OnInit, OnChanges {
    @Input()
    comments: CommentInterface[];
    @Input()
    newsId: string;
    @Input()
    expandable = true;

    @ViewChild('textarea') textarea: ElementRef;

    public currentUser$: Observable<UserInterface>;
    public comments$ = new ReplaySubject<CommentInterface[]>(1);
    public commentsWithActions$: Observable<CommentWithActionInterface[]>;
    public isExpanded = false;
    public isLoading = false;
    public editingCommentId: string | null = null;
    public smilesDropdownOpened = false;

    constructor(
        private commentsService: CommentsService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        protected languageService: LanguageService,
    ) {
        super(languageService);
    }

    ngOnInit(): void {
        this.currentUser$ = this.userService.getCurrentUser$();
        this.commentsWithActions$ = combineLatest([this.comments$, this.currentUser$]).pipe(
            map(([comments, user]: [CommentInterface[], UserInterface]) =>
                comments.map((comment: CommentInterface) => this.mapCommentWithAction(comment, user)),
            ),
        );

        if (!this.expandable) {
            this.isExpanded = true;
        }

        super.ngOnInit();
    }

    ngOnChanges({ comments }: SimpleChanges): void {
        if (comments && comments.currentValue) {
            this.comments$.next(comments.currentValue);
        }
    }

    public copyIdToComment(id: number): void {
        if (this.textarea) {
            this.textarea.nativeElement.value += ` #${id} `;
            this.textarea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    public toggleExpand(): void {
        this.isExpanded = !this.isExpanded;
    }

    public sendComment(): void {
        const text = this.textarea.nativeElement.value;

        if (!text) {
            return;
        }

        this.isLoading = true;

        this.commentsService
            .sendComment$(text, this.newsId)
            .pipe(
                take(1),
                finalize(() => (this.isLoading = false)),
                catchError((error: any) => {
                    console.log(error);

                    return Observable.throw(new Error(error));
                }),
            )
            .subscribe((updatedComments: CommentInterface[]) => {
                this.comments$.next(updatedComments);
                this.textarea.nativeElement.value = '';
            });
    }

    public formatDate(date: string): string {
        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }

    public deleteComment(commentId: string): void {
        this.commentsService
            .deleteComment$(commentId)
            .subscribe((commentActionResult: CommentActionResultInterface) =>
                this.processCommentActionResult(commentActionResult),
            );
    }

    public adminDeleteComment(commentId: string): void {
        this.dialog
            .open(AdminDeleteCommentDialogComponent)
            .afterClosed()
            .pipe(switchMap((reason: string) => this.commentsService.adminDeleteComment$(commentId, reason)))
            .subscribe((updatedComments: CommentInterface[]) => {
                this.comments$.next(updatedComments);
                this.textarea.nativeElement.value = '';
            });
    }

    public editComment(id: string): void {
        this.editingCommentId = id;

        this.comments$
            .pipe(take(1))
            .subscribe(
                (comments: CommentInterface[]) =>
                    (this.textarea.nativeElement.value = comments.find(
                        (comment: CommentInterface) => comment.id === this.editingCommentId,
                    ).comment),
            );
    }

    public cancelEditingComment(): void {
        this.editingCommentId = null;
        this.textarea.nativeElement.value = '';
    }

    public updateComment(): void {
        const text = this.textarea.nativeElement.value;

        if (!text) {
            return;
        }

        this.isLoading = true;

        this.commentsService
            .updateComment$(text, this.editingCommentId)
            .pipe(
                take(1),
                finalize(() => {
                    this.isLoading = false;
                    this.editingCommentId = null;
                }),
            )
            .subscribe((commentActionResult: CommentActionResultInterface) =>
                this.processCommentActionResult(commentActionResult),
            );
    }

    public openSmilesDropdown(event: Event): void {
        // TODO Animation
        this.smilesDropdownOpened = true;
        event.stopPropagation();
    }

    public closeSmilesDropdown(): void {
        // TODO Animation
        this.smilesDropdownOpened = false;
    }

    private mapCommentWithAction(comment: CommentInterface, user: UserInterface): CommentWithActionInterface {
        const isNewComment: boolean = moment(comment.datetimezone)
            .add(COMMENT_ACTION_PERIOD_MINUTES, 'minutes')
            .isAfter(moment());
        const isEditable: boolean = user && comment.playerId === user.id && isNewComment;
        const isAdminDeletable: boolean = !comment.reason && !isEditable && user && user.access === UserAccess.ADMIN;

        return { ...comment, isEditable, isAdminDeletable };
    }

    private processCommentActionResult({ result, comments }: CommentActionResultInterface): void {
        this.comments$.next(comments);
        this.textarea.nativeElement.value = '';

        if (result === CommentActionResult.TWO_MINUTES) {
            this.snackBar.open(this.translations.cantModify, this.translations.twoMinutesError, { duration: 3000 });
        }
    }
}
