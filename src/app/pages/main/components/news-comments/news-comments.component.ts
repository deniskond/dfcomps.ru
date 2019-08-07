import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { UserInterface } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user-service/user.service';
import { CommentInterface } from '../../../../interfaces/comments.interface';
import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommentsService } from '../../services/comments/comments.service';
import { ReplaySubject, Observable } from 'rxjs';
import { take, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-news-comments',
    templateUrl: './news-comments.component.html',
    styleUrls: ['./news-comments.component.less'],
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
    public isExpanded = false;
    public isLoading = false;

    constructor(private commentsService: CommentsService, private userService: UserService, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.currentUser$ = this.userService.getCurrentUser$();

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
                finalize(() => this.isLoading = false),
            )
            .subscribe((updatedComments: CommentInterface[]) => { 
                this.comments$.next(updatedComments);
                this.textarea.nativeElement.value = '';
            });
    }
}
