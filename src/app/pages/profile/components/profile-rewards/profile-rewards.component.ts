import { Component, Input } from '@angular/core';
import { Rewards } from '../../enums/rewards.enum';
import { PROFILE_REWARDS } from '../../config/profile-rewards.config';

@Component({
    selector: 'app-profile-rewards',
    templateUrl: './profile-rewards.component.html',
    styleUrls: ['./profile-rewards.component.less'],
})
export class ProfileRewardsComponent {
    @Input()
    rewards: Rewards[];

    public getRewardIconPath(reward: Rewards): string {
        return `/assets/images/rewards/${PROFILE_REWARDS.ICONS_MAP[reward]}.png`;
    }
}
