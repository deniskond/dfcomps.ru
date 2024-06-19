import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StreamingPlatforms } from '@dfcomps/contracts';

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
  @Input()
  videoType: StreamingPlatforms.TWITCH_CHANNEL | StreamingPlatforms.TWITCH_VIDEO;

  public iframeShown = false;
  public iframeLink: SafeUrl;

  constructor(public domSantizer: DomSanitizer) {}

  ngOnInit(): void {
    const embedType: string = {
      [StreamingPlatforms.TWITCH_CHANNEL]: 'channel',
      [StreamingPlatforms.TWITCH_VIDEO]: 'video',
    }[this.videoType];

    this.iframeLink = this.domSantizer.bypassSecurityTrustResourceUrl(
      `https://player.twitch.tv/?${embedType}=${this.id}&parent=${window.location.hostname}&autoplay=true`,
    );
  }
}
