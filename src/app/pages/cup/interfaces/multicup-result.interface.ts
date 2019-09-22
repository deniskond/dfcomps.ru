export interface MultiCupResultInterface {
    playerId: string;
    playerNick: string;
    playerCountry: string;
    roundResults: number[];
    overall: number;
    minround?: number;
}
