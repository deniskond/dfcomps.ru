import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'dfcomps.ru-admin-cups',
  templateUrl: './admin-cups.component.html',
  styleUrls: ['./admin-cups.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCupsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
