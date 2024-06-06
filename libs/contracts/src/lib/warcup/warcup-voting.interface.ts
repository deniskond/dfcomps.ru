export interface WarcupVotingInterface {
  maps: {
    mapSuggestionId: number;
    name: string;
    weapons: string;
    author: string;
    levelshot: string;
    adminVotes: string[];
  }[];
  currentVotedMapSuggestionId: number | null;
  adminSuggestedMapName: string | null;
}
