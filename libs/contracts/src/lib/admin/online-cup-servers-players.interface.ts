export interface OnlineCupServersPlayersInterface {
  servers: {
    address: string;
    players: {
      id: number;
      playerNick: string;
    }[];
  }[];
}
