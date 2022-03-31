import { PickbanPhases } from './../../enums/pickban-phases.enum';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { PickbanMapInterface } from '../../interfaces/pickban-map.interface';

@Component({
  selector: 'app-pickban-map',
  templateUrl: './pickban-map.component.html',
  styleUrls: ['./pickban-map.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickbanMapComponent implements OnChanges {
  @Input() pickbanPhase: PickbanPhases;
  @Input() map: PickbanMapInterface;

  @Output() banned = new EventEmitter<void>();

  public isBanned = false;
  public pickBanPhases = PickbanPhases;

  ngOnChanges({ map }: SimpleChanges): void {
    if (map && this.map) {
      if (this.map.isBannedByOpponent || this.map.isBannedByPlayer) {
        this.isBanned = true;
      }
    }
  }

  public banMap(): void {
    if (this.pickbanPhase !== PickbanPhases.YOU_ARE_BANNING) {
      return;
    }

    this.isBanned = true;
    this.banned.emit();
  }

  public getMapStyle(mapName: string): Record<string, string> {
    return { backgroundImage: `url(https://ws.q3df.org/images/levelshots/512x384/${mapName}.jpg)` };
  }
}
