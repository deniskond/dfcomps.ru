import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-html-news',
    templateUrl: './html-news.component.html',
    styleUrls: ['./html-news.component.less'],
})
export class HtmlNewsComponent implements OnInit {
    @Input() newsHtml: string;

    constructor(private domSanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.domSanitizer.bypassSecurityTrustHtml(this.newsHtml);
    }
}
