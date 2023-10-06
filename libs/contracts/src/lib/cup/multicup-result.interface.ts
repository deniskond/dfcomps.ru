export interface MulticupResultInterface {
  playerId: number;
  playerNick: string;
  playerCountry: string;
  roundResults: number[];
  overall: number;
  minround?: number;
  ratingChange: number;
}
