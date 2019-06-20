import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-place',
  templateUrl: './player-place.component.html',
  styleUrls: ['./player-place.component.less']
})
export class PlayerPlaceComponent {
    @Input() place: number;
}
