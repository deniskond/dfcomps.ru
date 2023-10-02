/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Round {
  players: (number | undefined)[];
  bannedMaps?: number[];
  winnerIndex?: number;
}

export interface Brackets {
  rounds: Round[];
}

export interface MapInfo {
  mapName: string;
  levelShotUrl: string;
  worldspawnUrl: string;
  stats?: unknown; // tbd
}
export interface PlayerInfo {
  playerName: string;
}

export interface CompetitionRules {
  numBans: number;
}

export interface CompetitionView {
  id: string;
  rules: CompetitionRules;
  brackets?: Brackets;
  mapPool: MapInfo[];
  players: PlayerInfo[];
}

export interface RoundView {
  players: { info: PlayerInfo }[];
  forbiddenBans: number[];
  bans: Record<number, number>;
  banTurn: number;
  stage: 'Ban' | 'Running' | 'Completed';
}

export function isCompetitionRules(x: any): x is CompetitionRules {
  return x instanceof Object && 'numBans' in x && parseInt(x['numBans']) == x.numBans;
}
