import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { Physics, WrLastFiveItemInterface } from '@dfcomps/contracts';
import { LastWrsService } from './last-wrs.service';

@Component({
  selector: 'app-last-wrs',
  templateUrl: './last-wrs.component.html',
  styleUrls: ['./last-wrs.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LastWrsComponent implements OnInit {
  @Input() physics: Physics;

  public records: WrLastFiveItemInterface[] = [];
  public isLoading = true;

  constructor(
    private lastWrsService: LastWrsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.lastWrsService.getLastFive$(this.physics).subscribe((records: WrLastFiveItemInterface[]) => {
      this.records = records;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  public formatTime(seconds: number): string {
    const totalMs = Math.round(seconds * 1000);
    const ms = totalMs % 1000;
    const totalSec = Math.floor(totalMs / 1000);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60);
    return `${min}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }
}
