import { DomSanitizer } from '@angular/platform-browser';
import { CommentInterface } from '../../../../interfaces/comments.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-news-comments',
    templateUrl: './news-comments.component.html',
    styleUrls: ['./news-comments.component.less'],
})
export class NewsCommentsComponent implements OnInit {
    @Input()
    comments: CommentInterface[];

    public isExpanded = false;

    constructor(private domSanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.comments.forEach(({ smilesComment }: CommentInterface) =>
            this.domSanitizer.bypassSecurityTrustStyle('margin-left:3px;'),
        );
    }

    public toggleExpand(): void {
        this.isExpanded = !this.isExpanded;
    }
}
