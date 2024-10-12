export interface WarcupVotingInterface {
  maps: {
    mapSuggestionId: number;
    name: string;
    weapons: string;
    author: string;
    levelshot: string;
    adminVotes: string[];
    suggestBy: string;
  }[];
  currentVotedMapSuggestionId: number | null;
}
