import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-input-round-result',
  templateUrl: './admin-input-round-result.component.html',
  styleUrls: ['./admin-input-round-result.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInputRoundResultComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
