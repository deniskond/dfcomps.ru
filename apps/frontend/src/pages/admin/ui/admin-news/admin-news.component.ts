import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'dfcomps.ru-admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
