import { Component } from '@angular/core';

@Component({
  selector: 'online-cup-timer',
  templateUrl: './online-cup-timer.component.html',
  styleUrls: ['./online-cup-timer.component.less'],
})
export class OnlineCupTimerComponent {
  placeholder = '?????';
  currentMap = 0;
  timerValue = 1800;
  interval: any;
  maps = [
    'qportal-blue',
    'tuffrun',
    'pea_lshit',
    'hangtime1-2',
    'jjm21-prostrafe',
  ];

  get minutes(): number {
    return Math.floor(this.timerValue / 60);
  }

  get displayedMinutes(): string {
    return this.minutes < 10 ? `0${this.minutes}`: `${this.minutes}`;
  }

  get seconds(): number {
    return this.timerValue - this.minutes * 60;
  }

  get displayedSeconds(): string {
    return this.seconds < 10 ? `0${this.seconds}`: `${this.seconds}`;
  }

  setMap(n: number): void {
    clearInterval(this.interval);
    this.currentMap = n;
    this.timerValue = 1800;

    this.interval = setInterval(() => {
      this.timerValue--;

      if (!this.timerValue) {
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
