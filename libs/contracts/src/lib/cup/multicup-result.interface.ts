export interface MulticupResultInterface {
  playerId: number;
  playerNick: string;
  playerCountry: string | null;
  roundResults: number[];
  overall: number;
  minround: number | null;
  ratingChange: number | null;
}
