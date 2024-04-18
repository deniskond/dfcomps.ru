import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-input-results',
  templateUrl: './admin-input-results.component.html',
  styleUrls: ['./admin-input-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInputResultsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
