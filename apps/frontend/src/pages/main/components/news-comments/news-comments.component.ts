import { CommentWithActionInterface } from './interfaces/comment-with-action.interface';
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommentsService } from '../../services/comments/comments.service';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { take, finalize, map, switchMap, filter } from 'rxjs/operators';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModeratorDeleteCommentDialogComponent } from './components/moderator-delete-comment-dialog/moderator-delete-comment-dialog.component';
import {
  smilesDialogAnimation,
  SMILES_DIALOG_OPENED,
  SMILES_DIALOG_CLOSED,
} from './animations/smiles-dialog.animation';
import { AnimationEvent } from '@angular/animations';
import { SmilesDropdownComponent } from './components/smiles-dropdown/smiles-dropdown.component';
import { SmileInterface } from '~shared/configs/smiles.config';
import { UserInterface } from '~shared/interfaces/user.interface';
import { LanguageService } from '~shared/services/language/language.service';
import { SmilesService } from '~shared/services/smiles/smiles.service';
import { UserService } from '~shared/services/user-service/user.service';
import {
  CommentActionResult,
  CommentActionResultInterface,
  CommentInterface,
  PersonalSmileInterface,
} from '@dfcomps/contracts';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';

const COMMENT_ACTION_PERIOD_MINUTES = 2;

@Component({
  selector: 'app-news-comments',
  templateUrl: './news-comments.component.html',
  styleUrls: ['./news-comments.component.less'],
  animations: [smilesDialogAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsCommentsComponent implements OnInit, OnChanges {
  @Input()
  comments: CommentInterface[];
  @Input()
  newsId: number;
  @Input()
  expanded = false;

  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('smilesDropdown') smilesDropdown: SmilesDropdownComponent;

  public currentUser$: Observable<UserInterface | null>;
  public comments$ = new ReplaySubject<CommentInterface[]>(1);
  public commentsWithActions$: Observable<CommentWithActionInterface[]>;
  public personalSmiles$: Observable<PersonalSmileInterface[]>;
  public isLoading = false;
  public editingCommentId: number | null = null;
  public smilesDropdownOpened = false;
  public smilesDropdownDisplayHidden = true;
  public openedAnimationState = SMILES_DIALOG_OPENED;
  public closedAnimationState = SMILES_DIALOG_CLOSED;
  public isOverflowVisible = false;

  constructor(
    private commentsService: CommentsService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private smilesService: SmilesService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initObservables();
  }

  ngOnChanges({ comments }: SimpleChanges): void {
    if (comments && comments.currentValue) {
      this.comments$.next(comments.currentValue);
    }
  }

  public copyIdToComment(id: number): void {
    if (this.textarea) {
      this.textarea.nativeElement.value += this.textarea.nativeElement.value ? ` #${id} ` : `#${id} `;
      this.textarea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.textarea.nativeElement.focus();
    }
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
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(
        (updatedComments: CommentInterface[]) => {
          this.comments$.next(updatedComments);
          this.textarea.nativeElement.value = '';
        },
        (error) => {
          const testForBan = error.error.message.match(/Comments banned until (.*)/);

          if (testForBan) {
            this.snackBar.open(`Comments banned until ${testForBan[1]}`, 'OK', { duration: 3000 });
          }
        },
      );
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm:ss');
  }

  public deleteComment(commentId: number): void {
    this.commentsService
      .deleteComment$(commentId)
      .subscribe((commentActionResult: CommentActionResultInterface) =>
        this.processCommentActionResult(commentActionResult),
      );
  }

  public moderatorDeleteComment(commentId: number): void {
    this.dialog
      .open(ModeratorDeleteCommentDialogComponent)
      .afterClosed()
      .pipe(
        filter((reason: string) => !!reason),
        switchMap((reason: string) => this.commentsService.moderatorDeleteComment$(commentId, reason)),
      )
      .subscribe((updatedComments: CommentInterface[]) => {
        this.comments$.next(updatedComments);
        this.textarea.nativeElement.value = '';
      });
  }

  public editComment(id: number): void {
    this.editingCommentId = id;

    this.comments$
      .pipe(take(1))
      .subscribe(
        (comments: CommentInterface[]) =>
          (this.textarea.nativeElement.value = comments.find(
            (comment: CommentInterface) => comment.commentId === this.editingCommentId,
          )!.comment),
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
      .updateComment$(text, this.editingCommentId!)
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
    if (!this.smilesDropdownOpened) {
      event.stopPropagation();
    }

    this.setOverflowVisible(true);
    this.smilesDropdownDisplayHidden = false;
    this.smilesDropdownOpened = true;
  }

  public closeSmilesDropdown(): void {
    this.smilesDropdownOpened = false;
    this.setOverflowVisible(false);
  }

  public onAnimationEnd(event: AnimationEvent): void {
    if (event.toState === SMILES_DIALOG_CLOSED) {
      this.smilesDropdownDisplayHidden = true;
      this.smilesDropdown.clearInput();
    }
  }

  public setOverflowVisible(isVisible: boolean): void {
    this.isOverflowVisible = isVisible;
  }

  public addSmile({ name }: SmileInterface): void {
    this.textarea.nativeElement.value += this.textarea.nativeElement.value ? ` :${name}:` : `:${name}:`;
  }

  private initObservables(): void {
    this.currentUser$ = this.userService.getCurrentUser$();
    this.personalSmiles$ = this.smilesService.getPersonalSmiles$();
    this.commentsWithActions$ = combineLatest([this.comments$, this.currentUser$]).pipe(
      map(([comments, user]: [CommentInterface[], UserInterface | null]) =>
        comments.map((comment: CommentInterface) => this.mapCommentWithAction(comment, user)),
      ),
    );
  }

  private mapCommentWithAction(comment: CommentInterface, user: UserInterface | null): CommentWithActionInterface {
    const isNewComment: boolean = moment(comment.datetimezone)
      .add(COMMENT_ACTION_PERIOD_MINUTES, 'minutes')
      .isAfter(moment());
    const isEditable: boolean = !!user && comment.playerId === user.id && isNewComment;
    const isModeratorDeletable: boolean =
      !comment.reason && !isEditable && !!user && checkUserRoles(user.roles, [UserRoles.MODERATOR]);

    return { ...comment, isEditable, isModeratorDeletable };
  }

  private processCommentActionResult({ result, comments }: CommentActionResultInterface): void {
    this.comments$.next(comments);
    this.textarea.nativeElement.value = '';

    if (result === CommentActionResult.TWO_MINUTES) {
      this.languageService
        .getTranslations$()
        .pipe(take(1))
        .subscribe((translations: Record<string, string>) =>
          this.snackBar.open(translations['cantModify'], translations['twoMinutesError'], { duration: 3000 }),
        );
    }
  }
}
