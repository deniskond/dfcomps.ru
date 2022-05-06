import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'dfcomps.ru-admin-validate',
  templateUrl: './admin-validate.component.html',
  styleUrls: ['./admin-validate.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminValidateComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
