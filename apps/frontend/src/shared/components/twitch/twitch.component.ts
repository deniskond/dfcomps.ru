import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwitchComponent implements OnInit {
  @Input()
  id: string;
  @Input()
  width: number;
  @Input()
  height: number;

  public iframeShown = false;
  public iframeLink: SafeUrl;

  constructor(public domSantizer: DomSanitizer) {}

  ngOnInit(): void {
    this.iframeLink = this.domSantizer.bypassSecurityTrustResourceUrl(
      `https://player.twitch.tv/?${this.id}&parent=dfcomps.ru&autoplay=false`,
    );
  }
}
