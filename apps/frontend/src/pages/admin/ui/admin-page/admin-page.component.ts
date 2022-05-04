import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
