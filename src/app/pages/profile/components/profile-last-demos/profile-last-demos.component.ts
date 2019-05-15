import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-profile-last-demos',
    templateUrl: './profile-last-demos.component.html',
    styleUrls: ['./profile-last-demos.component.less'],
})
export class ProfileLastDemosComponent {
    @Input()
    demos: string[];
}
