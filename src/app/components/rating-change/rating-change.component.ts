import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-rating-change',
    templateUrl: './rating-change.component.html',
    styleUrls: ['./rating-change.component.less'],
})
export class RatingChangeComponent implements OnInit {
    @Input()
    change: number;
    @Input()
    zeroIfNull = false;

    public defaultValue: string;

    ngOnInit(): void {
        this.defaultValue = this.zeroIfNull ? '0' : '-';
    }
}
