import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-add-multicup-round-news',
  templateUrl: './admin-multicup-round-news.component.html',
  styleUrls: ['./admin-multicup-round-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMulticupRoundNewsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
