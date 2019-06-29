import { CommentInterface } from '../../../../interfaces/comments.interface';
import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommentsService } from '../../services/comments/comments.service';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'app-news-comments',
    templateUrl: './news-comments.component.html',
    styleUrls: ['./news-comments.component.less'],
})
export class NewsCommentsComponent implements OnChanges {
    @Input()
    comments: CommentInterface[];
    @Input()
    newsId: string;

    @ViewChild('textarea') textarea: ElementRef;

    public comments$ = new ReplaySubject<CommentInterface[]>(1);
    public isExpanded = false;

    constructor(private commentsService: CommentsService) {}

    ngOnChanges({ comments }: SimpleChanges): void {
        if (comments && comments.currentValue) {
            this.comments$.next(comments.currentValue);
        }
    }

    public toggleExpand(): void {
        this.isExpanded = !this.isExpanded;
    }

    public sendComment(): void {
        const text = this.textarea.nativeElement.textContent;

        this.commentsService
            .sendComment$(text, this.newsId)
            .subscribe((updatedComments: CommentInterface[]) => this.comments$.next(updatedComments));
    }
}
