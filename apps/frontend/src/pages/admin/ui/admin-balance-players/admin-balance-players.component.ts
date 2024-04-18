import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-balance-players',
  templateUrl: './admin-balance-players.component.html',
  styleUrls: ['./admin-balance-players.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBalancePlayersComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
