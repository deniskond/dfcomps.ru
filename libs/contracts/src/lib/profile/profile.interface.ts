import { ProfileCupResponseInterface } from './profile-cup-response.interface';
import { ProfileDemosInterface } from './profile-demos.interface';
import { ProfileMainInfoInterface } from './profile-main-info.interface';
import { ProfileRewardsInterface } from './profile-rewards.interface';

export interface ProfileInterface {
  player: ProfileMainInfoInterface;
  rating: {
    cpm: number[];
    vq3: number[];
  };
  demos: ProfileDemosInterface[];
  cups: ProfileCupResponseInterface[];
  rewards: ProfileRewardsInterface[];
}
