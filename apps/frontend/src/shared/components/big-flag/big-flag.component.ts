import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-big-flag',
  templateUrl: './big-flag.component.html',
  styleUrls: ['./big-flag.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BigFlagComponent {
  @Input() country: string | null;
}
