export interface ParsedOnlineCupRoundInterface {
  roundResults: {
    serverNick: string;
    suggestedPlayer: {
      userId: number;
      nick: string;
    } | null;
    time: number;
  }[];
}
