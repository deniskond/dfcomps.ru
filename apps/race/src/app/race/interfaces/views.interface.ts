import { RoundProgress } from './data.interface';

type HostUrl = string;
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Round {
  players: (number | null)[];
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
  config: Partial<CustomizableConfig>;
  estTime: number;
  stats?: unknown; // tbd
}

export interface IncompleteMapInfo {
  mapName: string;
  levelShotUrl?: string;
  worldspawnUrl?: string;
  config?: Partial<CustomizableConfig>;
  estTime?: number;
  stats?: unknown; // tbd
}
export interface PlayerInfo {
  playerName: string;
}

export interface CustomizableConfig {
  promode: boolean;
  obsEnabled: boolean;
}

export interface CompetitionRules extends CustomizableConfig {
  numBans: number;
  forbidBans: boolean;
  raceServerHost?: HostUrl;
}

export interface CompetitionCreateInfo {
  name: string;
  rules: CompetitionRules;
}

export interface RawCompetitionView extends CompetitionCreateInfo {
  brackets?: Brackets;
  mapPool: { mapName: string }[];
  players: PlayerInfo[];
}

export interface CompetitionView extends CompetitionCreateInfo {
  id: string;
  brackets?: Brackets;
  mapPool: IncompleteMapInfo[];
  players: PlayerInfo[];
}

export interface RoundView {
  players: { info: PlayerInfo; serverUrl?: string }[];
  forbiddenBans: number[];
  order: number[];
  bans: Record<number, number>;
  banTurn: number;
  winner?: number;
  stage: 'Ban' | 'Running' | 'Completed';
}

export interface RoundProgressView {
  roundId: number;
  maps: IncompleteMapInfo[];
  players: PlayerInfo[];
  progress: Record<string, RoundProgress>;
}

export function isArray<T>(x: any, pred: (y: any) => y is T): x is T[] {
  if (!Array.isArray(x)) return false;
  return x.every((y) => pred(y));
}

export function array<T>(pred: (y: any) => y is T): (x: any) => x is T[] {
  return (x): x is T[] => isArray(x, pred);
}

export function isOptional<T>(x: any, pred: (y: any) => y is T): x is T | undefined {
  return x === undefined || pred(x);
}

export function optional<T>(pred: (y: any) => y is T): (x: any) => x is T | undefined {
  return (x): x is T | undefined => isOptional(x, pred);
}

export function isNullable<T>(x: any, pred: (y: any) => y is T): x is T | null {
  return x === null || pred(x);
}

export function nullable<T>(pred: (y: any) => y is T): (x: any) => x is T | null {
  return (x): x is T | null => isNullable(x, pred);
}

export function isInteger(x: any): x is number {
  return parseInt(x) == x;
}

export function isString(x: any): x is string {
  return typeof x === 'string';
}

export function isBoolean(x: any): x is boolean {
  return typeof x === 'boolean';
}

export function isValidHost(x: any): x is HostUrl {
  // [FIXME] use more specific url validation format
  return isString(x) && x.match(/^https?:\/\/[a-zA-Z0-9.]*$/) !== null;
}

export function isRound(x: any): x is Round {
  if (!(x instanceof Object)) return false;
  const p = x['players'];
  if (!isArray(p, nullable(isInteger))) return false;
  const bm = x['bannedMaps'];
  if (!isOptional(bm, array(isInteger))) return false;
  return isOptional(x['winnerIndex'], isInteger);
}

export function isMapInfo(x: any): x is MapInfo {
  return x instanceof Object && isString(x['mapName']) && isString(x['levelShotUrl']) && isString(x['worldspawnUrl']);
}

export function isPlayerInfo(x: any): x is PlayerInfo {
  return x instanceof Object && isString(x['playerName']);
}

export function isIncompleteMapInfo(x: any): x is IncompleteMapInfo {
  return (
    x instanceof Object &&
    isString(x['mapName']) &&
    isOptional(x['levelShotUrl'], isString) &&
    isOptional(x['worldspawnUrl'], isString)
  );
}
export function isBrackets(x: any): x is Brackets {
  return x instanceof Object && isArray(x['rounds'], isRound);
}

export function isOptionalCustomizableConfig(x: any): x is Partial<CustomizableConfig> {
  return (
    x instanceof Object &&
    (!('promode' in x) || isBoolean(x['promode'])) &&
    (!('obsEnabled' in x) || isBoolean(x['obsEnabled']))
  );
}

export function isCompetitionRules(x: any): x is CompetitionRules {
  const res =
    x instanceof Object &&
    'numBans' in x &&
    isInteger(x['numBans']) &&
    (x['raceServerHost'] === undefined || isValidHost(x['raceServerHost']));
  return res;
}

export function isCompetitionCreateInfo(x: any): x is CompetitionCreateInfo {
  return x instanceof Object && 'name' in x && typeof x['name'] === 'string' && isCompetitionRules(x['rules']);
}

export function isRawCompetitionInfo(x: any): x is RawCompetitionView {
  return (
    x instanceof Object &&
    'name' in x &&
    typeof x['name'] === 'string' &&
    isCompetitionRules(x['rules']) &&
    isOptional(x['brackets'], isBrackets) &&
    isArray(x['mapPool'], isIncompleteMapInfo) &&
    isArray(x['players'], isPlayerInfo)
  );
}
