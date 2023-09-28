import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscordOauthComponent } from './discord-oauth.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DiscordOauthComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DiscordOauthComponent,
      },
    ]),
  ],
})
export class DiscordOauthModule {}
