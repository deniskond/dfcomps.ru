import { ProfileCupResponseInterface } from './profile-cup-response.interface';
import { ProfileDemosInterface } from './profile-demos.interface';
import { ProfileMainInfoInterface } from './profile-main-info.interface';
import { ProfileRewardsInterface } from './profile-rewards.interface';
import { ProfileCupStatInterface } from './profile-cup-stat.interface';

export interface ProfileInterface {
  player: ProfileMainInfoInterface;
  rating: {
    cpm: number[];
    vq3: number[];
  };
  stats: ProfileCupStatInterface;
  demos: ProfileDemosInterface[];
  cups: ProfileCupResponseInterface[];
  rewards: ProfileRewardsInterface[];
  cupsCount: number;
}
