import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-one-v-one-rating-change',
    templateUrl: './one-v-one-rating-change.component.html',
    styleUrls: ['./one-v-one-rating-change.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneVOneRatingChangeComponent {
    @Input() ratingChange: number;
}
