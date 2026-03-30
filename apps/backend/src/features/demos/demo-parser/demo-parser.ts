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
import { DemoTimerSection } from './structures/demo-timer-section.interface';

function getTimeByMillis(millis: number): string {
  const ms = millis % 1000;
  const totalSec = Math.floor(millis / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  return `${String(totalMin).padStart(2, '0')}.${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function getDiffByMillis(diff: number): string {
  const ms = diff % 1000;
  const totalSec = Math.floor(diff / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  if (seconds < 1) return `0.${String(ms).padStart(3, '0')}`;
  if (totalMin < 1) return `${seconds}.${String(ms).padStart(3, '0')}`;
  return `${totalMin}.${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function getNumKey(num: number): string {
  return num <= 1 ? '' : ` ${num}`;
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

function buildTimer(consoleValues: string[]): DemoTimerSection | null {
  // Find last TimerStopped, tracking TR via TimerStarted count
  let timerStartedCount = 0;
  let lastTimerStopped: string | null = null;
  let isTr = false;

  for (const cmd of consoleValues) {
    if (cmd.startsWith('TimerStarted')) {
      timerStartedCount++;
    } else if (cmd.startsWith('TimerStopped')) {
      isTr = timerStartedCount > 1;
      timerStartedCount = 0;
      lastTimerStopped = cmd;
    }
  }

  if (!lastTimerStopped) return null;

  const timer: DemoTimerSection = { Source: lastTimerStopped };

  // Parse: TimerStopped <time_ms> <cp_count> [cp1_ms cp2_ms ...] [Stats ...]
  const parts = lastTimerStopped.split(' ');
  const millis = parseInt(parts[1] ?? '-1', 10);
  if (millis < 0) return timer;

  const partOffset = parseInt(parts[2] ?? '-1', 10);
  if (partOffset < 0) return timer;

  const cpData: number[] = [];
  for (let i = 0; i < partOffset; i++) {
    cpData.push(parseInt(parts[3 + i] ?? '0', 10));
  }

  let diff = '';
  let cpCount = 0;
  for (let i = 0; i < cpData.length; i++) {
    if (i > 0) {
      const segDiff = cpData[i] - cpData[i - 1];
      diff = segDiff > 0 ? ` (+${getDiffByMillis(segDiff)})` : '';
    }
    timer[`CheckPoint${getNumKey(++cpCount)}`] = getTimeByMillis(cpData[i]) + diff;
  }

  if (cpData.length > 0) {
    const segDiff = millis - cpData[cpData.length - 1];
    diff = segDiff > 0 ? ` (+${getDiffByMillis(segDiff)})` : '';
  } else {
    diff = '';
  }
  timer['FinishTimer'] = getTimeByMillis(millis) + diff;

  timer['timereset'] = isTr ? 'true' : 'false';

  // Parse Stats section
  const statsIndex = partOffset + 3;
  if (parts[statsIndex] === 'Stats') {
    const pmoveDepends = parseInt(parts[statsIndex + 1] ?? '-1', 10);
    const pmoveFixed = parseInt(parts[statsIndex + 2] ?? '-1', 10);
    const svFps = parseInt(parts[statsIndex + 3] ?? '-1', 10);
    const comMaxFps = parseInt(parts[statsIndex + 4] ?? '-1', 10);
    const gSync = parseInt(parts[statsIndex + 5] ?? '-1', 10);

    if (pmoveFixed >= 0) timer['pmove_fixed'] = pmoveFixed.toString();
    if (svFps >= 0) timer['sv_fps'] = svFps.toString();
    if (comMaxFps >= 0) timer['com_maxfps'] = comMaxFps.toString();
    if (gSync >= 0) timer['g_sync'] = gSync.toString();

    if (pmoveDepends <= 4) {
      const pmoveMsec = parseInt(parts[statsIndex + 6] ?? '-1', 10);
      if (pmoveMsec >= 0) timer['pmove_msec'] = pmoveMsec.toString();
    }

    const allWeapons = parseInt(parts[statsIndex + 7] ?? '-1', 10);
    const noDamage = parseInt(parts[statsIndex + 8] ?? '-1', 10);
    const enablePowerups = parseInt(parts[statsIndex + 9] ?? '-1', 10);

    if (allWeapons >= 0) timer['all_weapons'] = allWeapons.toString();
    if (noDamage >= 0) timer['no_damage'] = noDamage.toString();
    if (enablePowerups >= 0) timer['enable_powerups'] = enablePowerups.toString();
  }

  return timer;
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
