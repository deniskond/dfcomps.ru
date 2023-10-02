import { Physics } from '@dfcomps/contracts';

export interface ProfileCupInterface {
  newsId: string;
  fullName: string;
  shortName: string;
  physics: Physics;
  resultPlace: number;
  ratingChange: number;
}
