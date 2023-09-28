import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs';
import { isNonNull } from '~shared/helpers';

@Component({
  templateUrl: './discord-oauth.component.html',
  styleUrls: ['./discord-oauth.component.less'],
})
export class DiscordOauthComponent {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.fragment.pipe(take(1), filter(isNonNull)).subscribe((fragment: string) => {
      const params = new URLSearchParams(fragment);

      console.log(params.get('access_token'));
    });
  }
}
