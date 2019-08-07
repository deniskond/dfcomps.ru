import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input } from '@angular/core';
import { Rewards } from '../../enums/rewards.enum';
import { PROFILE_REWARDS } from '../../config/profile-rewards.config';

@Component({
    selector: 'app-profile-rewards',
    templateUrl: './profile-rewards.component.html',
    styleUrls: ['./profile-rewards.component.less'],
})
export class ProfileRewardsComponent extends Translations {
    @Input()
    rewards: Rewards[];

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    public getRewardIconPath(reward: Rewards): string {
        return `/assets/images/rewards/${PROFILE_REWARDS.ICONS_MAP[reward]}.png`;
    }
}
