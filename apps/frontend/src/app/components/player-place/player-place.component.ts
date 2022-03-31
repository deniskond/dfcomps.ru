import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-player-place',
  templateUrl: './player-place.component.html',
  styleUrls: ['./player-place.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPlaceComponent {
  @Input() place: number;
}
