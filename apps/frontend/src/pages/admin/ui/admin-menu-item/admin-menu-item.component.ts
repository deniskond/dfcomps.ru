import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'admin-menu-item',
  templateUrl: './admin-menu-item.component.html',
  styleUrls: ['./admin-menu-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenuItemComponent implements OnInit {
  @Input() caption: string;
  @Input() icon: string;
  @Input() isActive: boolean;

  constructor() {}

  ngOnInit(): void {}
}
