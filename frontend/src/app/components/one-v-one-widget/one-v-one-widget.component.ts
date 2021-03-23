import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-one-v-one-widget',
    templateUrl: './one-v-one-widget.component.html',
    styleUrls: ['./one-v-one-widget.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneVOneWidgetComponent {}
