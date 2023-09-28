/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoundView } from '../race/interfaces/views.iterface';
import { ErrorMessage } from '../race/types/result';

export interface InRoundBan {
  action: 'Ban';
  mapIndex: number;
}

export interface InRoundUnban {
  action: 'Unban';
  mapIndex: number;
}

export interface InRoundReset {
  action: 'Reset';
}

export interface InRoundStart {
  action: 'Start';
}

export interface InRoundComplete {
  action: 'Complete';
  winner: number;
}

export interface OutActionError {
  err: ErrorMessage;
}

export interface OutUpdate {
  result: RoundView;
}

type InMessage = InRoundBan | InRoundUnban | InRoundReset | InRoundStart | InRoundComplete;

export function isInMessage(x: any): x is InMessage {
  return (
    (x instanceof Object && (x['action'] === 'Ban' || x['action'] === 'Unban') && !isNaN(parseInt(x['mapIndex']))) ||
    x['action'] === 'Reset' ||
    x['action'] === 'Start' ||
    (x['action'] === 'Complete' && !isNaN(parseInt(x['winner'])))
  );
}

export function isInRoundBan(x: any): x is InRoundBan {
  return x instanceof Object && x['action'] === 'Ban' && !isNaN(parseInt(x['mapIndex']));
}

export function isInRoundUnban(x: any): x is InRoundUnban {
  return x instanceof Object && x['action'] === 'Unban' && !isNaN(parseInt(x['mapIndex']));
}

export function isInRoundReset(x: any): x is InRoundReset {
  return x instanceof Object && x['action'] === 'Reset';
}

export function isInRoundStart(x: any): x is InRoundStart {
  return x instanceof Object && x['action'] === 'Start';
}

export function isInRoundComplete(x: any): x is InRoundComplete {
  return x instanceof Object && x['action'] === 'Complete' && !isNaN(parseInt(x['winner']));
}
