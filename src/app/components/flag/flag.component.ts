import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-flag',
    templateUrl: './flag.component.html',
    styleUrls: ['./flag.component.less'],
})
export class FlagComponent {
    @Input()
    country: string;
}
