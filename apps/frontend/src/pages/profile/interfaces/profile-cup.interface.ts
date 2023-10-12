import { Physics } from '@dfcomps/contracts';

export interface ProfileCupInterface {
  newsId: number | null;
  fullName: string;
  shortName: string;
  physics: Physics;
  resultPlace: number;
  ratingChange: number;
}
