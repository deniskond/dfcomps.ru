export interface WarcupVotingInterface {
  maps: {
    mapSuggestionId: number;
    name: string;
    weapons: string;
    adminVotes: string[];
  }[];
  hasSuggestedAlready: boolean;
}
