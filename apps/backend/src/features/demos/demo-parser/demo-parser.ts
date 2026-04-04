import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Physics } from '@dfcomps/contracts';
import { DemoConfigInterface } from '../demo-config.interface';
import { Q3Const } from './const/q3-const';
import { Q3DemoParser } from './parser/q3-demo-parser';
import { Q3Utils } from './utils/q3-utils';
import { ClientEvent } from './structures/client-event';
import { ClientConnection } from './structures/client-connection';
import { DemoRecordSection } from './structures/demo-record-section.interface';

function getTimeByMillis(millis: number): string {
  const ms = millis % 1000;
  const totalSec = Math.floor(millis / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  return `${String(totalMin).padStart(2, '0')}.${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function hasStartBefore(events: ClientEvent[], index: number): boolean {
  for (let i = index - 1; i >= 0; i--) {
    const prev = events[i];
    if (prev.eventChangePmType || prev.eventChangeUser) return false;
    if (prev.eventStartTime || prev.eventTimeReset) return true;
  }
  return false;
}

function isFinishCorrect(events: ClientEvent[], index: number): 'CORRECT_START' | 'CORRECT_TR' | 'INCORRECT' {
  if (!events[index].eventFinish) return 'INCORRECT';
  for (let i = index - 1; i >= 0; i--) {
    const prev = events[i];
    if (prev.eventChangePmType || prev.eventFinish) return 'INCORRECT';
    events[index].timeByServerTime = events[index].serverTime - prev.serverTime;
    if (prev.eventTimeReset) return 'CORRECT_TR';
    if (prev.eventStartTime) return hasStartBefore(events, i) ? 'CORRECT_TR' : 'CORRECT_START';
    if (prev.eventStartFile || prev.eventChangeUser) return 'INCORRECT';
  }
  return 'INCORRECT';
}

function getCorrectFinishEvent(
  events: ClientEvent[],
): { finishType: 'CORRECT_START' | 'CORRECT_TR'; event: ClientEvent } | null {
  let best: { finishType: 'CORRECT_START' | 'CORRECT_TR'; event: ClientEvent; timeNoError: number } | null = null;
  for (let i = events.length - 1; i >= 0; i--) {
    const finType = isFinishCorrect(events, i);
    if (finType !== 'INCORRECT') {
      const ev = events[i];
      const timeNoError = ev.timeNoError;
      if (timeNoError > 0 && (best === null || timeNoError < best.timeNoError)) {
        best = { finishType: finType, event: ev, timeNoError };
      }
    }
  }
  return best ? { finishType: best.finishType, event: best.event } : null;
}

function getPlayerName(configs: Record<number, string>, playerNum: number): string | null {
  const configStr = configs[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER + playerNum];
  if (!configStr) return null;
  const parsed = Q3Utils.splitConfig(configStr);
  return parsed['n'] ?? parsed['name'] ?? null;
}

function parseConsoleTimeStrings(consoleValues: string[]): string[] {
  const result: string[] = [];
  for (const cmd of consoleValues) {
    if (
      cmd.includes('reached the finish line in') ||
      cmd.includes('broke the server record') ||
      cmd.includes('you are now rank') ||
      cmd.includes('equalled the server record with') ||
      cmd.startsWith('print "Time performed by') ||
      cmd.startsWith('NewTime') ||
      cmd.startsWith('newTime') ||
      cmd.startsWith('print "^3Time Performed:')
    ) {
      result.push(cmd);
    }
  }
  return result;
}

function buildRecord(
  demoName: string,
  clientEvents: ClientEvent[],
  clc: ClientConnection,
  maxSpeed: number,
): DemoRecordSection {
  const record: DemoRecordSection = { demoname: '' };

  record['demoname'] = path.basename(demoName);

  const consoleValues = Object.values(clc.console).map((v) => v.command);

  // Date from console
  const dateCmd = [...consoleValues].reverse().find((v) => v.startsWith('print "Date:'));
  if (dateCmd) {
    record['date'] = dateCmd;
  }

  // Time strings from console
  const timeStrings = parseConsoleTimeStrings(consoleValues);
  if (timeStrings.length === 1) {
    record['time'] = timeStrings[0];
  } else if (timeStrings.length > 1) {
    timeStrings.forEach((ts, i) => {
      record[`time ${i + 1}`] = ts;
    });
  }

  // bestTime from correct finish event
  const fin = getCorrectFinishEvent(clientEvents);
  if (fin) {
    const bestTime = getTimeByMillis(fin.event.timeNoError);
    record['bestTime'] = bestTime + (fin.finishType === 'CORRECT_TR' ? ' (Time reset)' : '');
  }

  if (maxSpeed > 0) {
    record['maxSpeed'] = maxSpeed.toString();
  }

  // spectatorRecorded and lateStart
  let startFileUserName: string | null = null;
  let startTimerUserName: string | null = null;
  let startFileServerTime = 0;
  let startTimerServerTime = 0;

  for (const ce of clientEvents) {
    if (ce.eventStartFile) {
      startFileUserName = getPlayerName(clc.configs, clc.clientNum) ?? getPlayerName(clc.configs, ce.playerNum);
      startFileServerTime = ce.serverTime;
    }
    if (ce.eventStartTime && startTimerServerTime === 0) {
      startTimerUserName = getPlayerName(clc.configs, ce.playerNum);
      startTimerServerTime = ce.serverTime;
    }
  }

  if (startFileUserName && startTimerUserName && startFileUserName !== startTimerUserName) {
    record['spectatorRecorded'] = 'true';
  }

  const lateMs = startTimerServerTime - startFileServerTime;
  if (lateMs > 0) {
    const totalSec = Math.floor(lateMs / 1000);
    if (totalSec > 20) {
      record['lateStart'] = `${totalSec} sec (ServerTime: ${getTimeByMillis(startTimerServerTime)})`;
    }
  }

  return record;
}

@Injectable()
export class DemoParser {
  public parseDemo(demoName: string): DemoConfigInterface | null {
    let rawInfo: ReturnType<typeof Q3DemoParser.getRawInfo>;

    try {
      rawInfo = Q3DemoParser.getRawInfo(demoName);
    } catch {
      return null;
    }

    const { clc, client } = rawInfo;
    const conf = clc.configs;

    const clientConfig = conf[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT]
      ? Q3Utils.splitConfig(conf[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT])
      : {};
    const gameConfig = conf[Q3Const.Q3_DEMO_CFG_FIELD_GAME]
      ? Q3Utils.splitConfig(conf[Q3Const.Q3_DEMO_CFG_FIELD_GAME])
      : {};
    const playerConfig = conf[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER]
      ? Q3Utils.splitConfig(conf[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER])
      : {};

    const record = buildRecord(demoName, client.clientEvents, clc, client.maxSpeed);

    let time: string | undefined;
    let isTimeReset: boolean | undefined;
    if (record.bestTime) {
      const TIME_RESET_SUFFIX = ' (Time reset)';
      if (record.bestTime.endsWith(TIME_RESET_SUFFIX)) {
        time = record.bestTime.slice(0, -TIME_RESET_SUFFIX.length);
        isTimeReset = true;
      } else {
        time = record.bestTime;
        isTimeReset = false;
      }
    }

    return {
      defragGameType: clientConfig['defrag_gametype'] ?? '',
      rawDemoInfo: conf[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER] ?? '',
      serverFPS: gameConfig['defrag_svfps'] ?? '',
      handicap: playerConfig['hc'] ?? '',
      g_synchronousClients: gameConfig['g_synchronousClients'] ?? '',
      mapName: clientConfig['mapname'] ?? '',
      defragVersion: clientConfig['defrag_vers'] ?? '',
      physic: clientConfig['df_promode'] === '0' ? Physics.VQ3 : Physics.CPM,
      g_gravity: gameConfig['g_gravity'] ?? '',
      g_knockback: gameConfig['g_knockback'] ?? '',
      g_speed: gameConfig['g_speed'] ?? '',
      pmove_msec: gameConfig['pmove_msec'] ?? '',
      sv_cheats: gameConfig['sv_cheats'] ?? '',
      timescale: gameConfig['timescale'] ?? '',
      areOBsEnabled: gameConfig['defrag_obs'] ?? '',
      pmove_fixed: gameConfig['pmove_fixed'] ?? '',
      maxSpeed: record.maxSpeed,
      time,
      isTimeReset,
    };
  }
}
