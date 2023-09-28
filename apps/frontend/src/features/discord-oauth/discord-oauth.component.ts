import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { isNonNull } from '~shared/helpers';

@Component({
  templateUrl: './discord-oauth.component.html',
  styleUrls: ['./discord-oauth.component.less'],
})
export class DiscordOauthComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.fragment.pipe(take(1), filter(isNonNull)).subscribe((fragment: string) => {
      const params = new URLSearchParams(fragment);
      const accessToken: string | null = params.get('access_token');
      const state: string | null = params.get('state');

      if (accessToken && state) {
        localStorage.setItem('discordAccessToken', accessToken);
        localStorage.setItem('discordOAuthState', state);
      }

      this.router.navigate(['/']);
    });
  }
}
