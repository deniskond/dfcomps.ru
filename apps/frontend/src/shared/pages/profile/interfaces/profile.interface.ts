import { ProfileMainInfoInterface } from './profile-main-info.interface';
import { ProfileDemosDtoInterface } from '../dto/profile-demos.dto';
import { ProfileCupDtoInterface } from '../dto/profile-cup.dto';
import { ProfileRewardsDtoInterface } from '../dto/profile-rewards.dto';

export interface ProfileInterface {
  player: ProfileMainInfoInterface;
  rating: {
    cpm: string[];
    vq3: string[];
  };
  demos: ProfileDemosDtoInterface[];
  cups: ProfileCupDtoInterface[];
  rewards: ProfileRewardsDtoInterface[];
}
