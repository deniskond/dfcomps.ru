export const RATING_MODIFIERS = [20, 50, 100] as const;
export type RatingModifier = (typeof RATING_MODIFIERS)[number];
export const DEFAULT_RATING_MODIFIER: RatingModifier = 100;
