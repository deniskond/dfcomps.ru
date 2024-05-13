export interface OnlineCupServersPlayersInterface {
  cupName: string;
  servers: {
    address: string;
    players: {
      id: number;
      playerNick: string;
      country: string | null;
    }[];
  }[];
}
