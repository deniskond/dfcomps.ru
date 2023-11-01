import { ValidDemoInterface } from '@dfcomps/contracts';

export interface TableEntryWithRatingInterface extends ValidDemoInterface {
  ratingChange: number;
  hasBothPhysicsBonus: boolean;
  placeInTable: number;
}
