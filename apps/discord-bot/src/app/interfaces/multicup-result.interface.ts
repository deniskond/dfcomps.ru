export interface MulticupResultInterface {
  playerId: string;
  playerNick: string;
  playerCountry: string;
  roundResults: number[];
  overall: number;
  minround?: number;
}
