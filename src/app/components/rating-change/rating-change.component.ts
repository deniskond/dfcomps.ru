import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-rating-change',
    templateUrl: './rating-change.component.html',
    styleUrls: ['./rating-change.component.less'],
})
export class RatingChangeComponent {
    @Input()
    change: number;
}
