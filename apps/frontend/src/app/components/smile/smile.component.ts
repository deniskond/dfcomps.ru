import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { SmileInterface } from '../../configs/smiles.config';

@Component({
  selector: 'app-smile',
  templateUrl: './smile.component.html',
  styleUrls: ['./smile.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmileComponent {
  @Input() smile: SmileInterface;
  @Input() isBig: boolean;

  public getSmileStyle({ col, row }: SmileInterface): Record<string, string> {
    return {
      background: `url('/assets/images/smiles/smiles.png')`,
      'background-position-x': `-${(col - 1) * 32}px`,
      'background-position-y': `-${(row - 1) * 32}px`,
    };
  }
}
