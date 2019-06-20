import { DomSanitizer } from '@angular/platform-browser';
import { NewsSimpleInterface } from '../../../../services/news-service/interfaces/news-simple.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-news-simple',
    templateUrl: './news-simple.component.html',
    styleUrls: ['./news-simple.component.less'],
})
export class NewsSimpleComponent implements OnInit {
    @Input() news: NewsSimpleInterface;

    constructor(private domSanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.domSanitizer.bypassSecurityTrustHtml(this.news.text);
    }
}
