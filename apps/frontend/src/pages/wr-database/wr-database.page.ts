import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './wr-database.page.html',
  styleUrls: ['./wr-database.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WrDatabasePageComponent {
  public refreshTrigger = 0;

  public onUploadSuccess(): void {
    this.refreshTrigger++;
  }
}
