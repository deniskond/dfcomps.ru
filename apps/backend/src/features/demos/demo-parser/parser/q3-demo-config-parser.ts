import { Q3Const } from '../const/q3-const';
import { Q3_SVC } from '../const/q3-svc';
import { Q3HuffmanReader } from '../huffman/q3-huffman-reader';
import { CLSnapshot } from '../structures/cl-snapshot';
import { ClientConnection } from '../structures/client-connection';
import { ClientEvent } from '../structures/client-event';
import { ClientState } from '../structures/client-state';
import { EntityState } from '../structures/entity-state';
import { PlayerState } from '../structures/player-state';
import {
  ErrorBadChecksum,
  ErrorBadCommandInParseGameState,
  ErrorBaselineNumberOutOfRange,
  ErrorDeltaFrameTooOld,
  ErrorDeltaFromInvalidFrame,
  ErrorDeltaParseEntitiesNumTooOld,
  ErrorMatchPhysics,
  ErrorParsePacketEntitiesEndOfMessage,
  ErrorParseSnapshotInvalidsize,
  ErrorUnableToParseDeltaEntityState,
} from '../utils/parser-ex';
import { Q3Utils } from '../utils/q3-utils';
import { Q3DemoMessage } from './q3-demo-message';

export class Q3DemoConfigParser {
  public clc: ClientConnection = new ClientConnection();
  public client: ClientState = new ClientState();
  private serverTime: number = 0;

  parse(message: Q3DemoMessage): boolean {
    this.serverTime = 0;
    this.clc.serverMessageSequence = message.sequence;
    const reader = new Q3HuffmanReader(message.data);
    reader.readLong();

    while (!reader.isEOD()) {
      const b = reader.readByte();
      switch (b) {
        case Q3_SVC.BAD:
        case Q3_SVC.NOP:
          return true;
        case Q3_SVC.EOF:
          return true;
        case Q3_SVC.SERVERCOMMAND:
          this.parseServerCommand(reader);
          break;
        case Q3_SVC.GAMESTATE:
          this.parseGameState(reader);
          break;
        case Q3_SVC.SNAPSHOT:
          this.parseSnapshot(reader);
          break;
        default:
          return true;
      }
    }
    return true;
  }

  private parseServerCommand(reader: Q3HuffmanReader): void {
    const key = reader.readLong();
    const value = reader.readString();
    this.clc.console[key] = { time: this.serverTime, command: value };
  }

  private parseGameState(reader: Q3HuffmanReader): void {
    reader.readLong();

    while (true) {
      const cmd = reader.readByte();
      if (cmd === Q3_SVC.EOF) break;

      switch (cmd) {
        case Q3_SVC.CONFIGSTRING: {
          const key = reader.readShort();
          if (key < 0 || key > Q3Const.MAX_CONFIGSTRINGS) return;
          this.clc.configs[key] = reader.readBigString();
          break;
        }

        case Q3_SVC.BASELINE: {
          const newnum = reader.readNumBits(Q3Const.GENTITYNUM_BITS);
          if (newnum < 0 || newnum >= Q3Const.MAX_GENTITIES) {
            Q3Utils.printDebug(this.clc.errors, new ErrorBaselineNumberOutOfRange());
            return;
          }
          const es = Q3Utils.getOrCreate(this.clc.entityBaselines, newnum, () => new EntityState());
          if (!reader.readDeltaEntity(es, newnum)) {
            Q3Utils.printDebug(this.clc.errors, new ErrorUnableToParseDeltaEntityState());
            return;
          }
          break;
        }

        default:
          Q3Utils.printDebug(this.clc.errors, new ErrorBadCommandInParseGameState());
          return;
      }
    }

    this.clc.clientNum = reader.readLong();
    this.clc.checksumFeed = reader.readLong();
  }

  private parseSnapshot(decoder: Q3HuffmanReader): void {
    // Initialize client and game state from config strings once on first snapshot
    if (this.client.clientConfig === null) {
      this.client.clientConfig = {};

      if (this.clc.configs[Q3Const.Q3_DEMO_CFG_FIELD_GAME]) {
        const gameConfig = Q3Utils.splitConfig(this.clc.configs[Q3Const.Q3_DEMO_CFG_FIELD_GAME]);
        this.client.isCheatsOn = Q3Utils.getOrZero(gameConfig, 'sv_cheats') > 0;
      }

      if (this.clc.configs[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT]) {
        this.client.clientConfig = Q3Utils.splitConfig(this.clc.configs[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT]);
        this.client.dfvers = Q3Utils.getOrZero(this.client.clientConfig, 'defrag_vers');
        this.client.mapname = Q3Utils.getOrNull(this.client.clientConfig, 'mapname') ?? '';
        this.client.mapNameChecksum = this.getMapNameChecksum(this.client.mapname);
        this.client.isOnline = Q3Utils.getOrZero(this.client.clientConfig, 'defrag_gametype') > 4;
      }
    }

    const newSnap = new CLSnapshot();
    let old: CLSnapshot | null = null;

    newSnap.serverTime = decoder.readLong();
    newSnap.messageNum = this.clc.serverMessageSequence;
    this.serverTime = newSnap.serverTime;

    const deltaNum = decoder.readByte();
    if (deltaNum === 0) {
      newSnap.deltaNum = -1;
    } else {
      newSnap.deltaNum = newSnap.messageNum - deltaNum;
    }
    newSnap.snapFlags = decoder.readByte();

    if (newSnap.deltaNum <= 0) {
      newSnap.valid = true;
      old = null;
      this.clc.demowaiting = false;
    } else {
      old = this.client.snapshots[newSnap.deltaNum & Q3Const.PACKET_MASK] ?? new CLSnapshot();
      if (!old.valid) {
        Q3Utils.printDebug(this.clc.errors, new ErrorDeltaFromInvalidFrame());
      } else if (old.messageNum !== newSnap.deltaNum) {
        Q3Utils.printDebug(this.clc.errors, new ErrorDeltaFrameTooOld());
      } else if (this.client.parseEntitiesNum - old.parseEntitiesNum > Q3Const.MAX_PARSE_ENTITIES - 128) {
        Q3Utils.printDebug(this.clc.errors, new ErrorDeltaParseEntitiesNumTooOld());
      } else {
        newSnap.valid = true;
      }
    }

    const len = decoder.readByte();
    if (len > newSnap.areamask.length) {
      Q3Utils.printDebug(this.clc.errors, new ErrorParseSnapshotInvalidsize());
      return;
    }
    decoder.readData(newSnap.areamask, len);

    if (old !== null) {
      newSnap.ps.copy(old.ps);
    }
    decoder.readDeltaPlayerState(newSnap.ps);
    this.parsePacketEntities(decoder, old, newSnap);

    if (!newSnap.valid) {
      return;
    }

    // Invalidate dropped packets in the circular buffer
    let oldMessageNum = this.client.snap.messageNum + 1;
    if (newSnap.messageNum - oldMessageNum >= Q3Const.PACKET_BACKUP) {
      oldMessageNum = newSnap.messageNum - (Q3Const.PACKET_BACKUP - 1);
    }
    for (; oldMessageNum < newSnap.messageNum; oldMessageNum++) {
      const s = this.client.snapshots[oldMessageNum & Q3Const.PACKET_MASK];
      if (s) s.valid = false;
    }

    this.client.snap = newSnap;
    this.client.snap.ping = 0;
    this.client.snapshots[this.client.snap.messageNum & Q3Const.PACKET_MASK] = this.client.snap;

    this.updateClientEvents(newSnap);
  }

  private updateClientEvents(snapshot: CLSnapshot): void {
    if (this.client.dfvers <= 0 || this.client.mapname.length <= 0) {
      return;
    }

    const timeResult = this.getTime(snapshot.ps, snapshot.serverTime, this.client.dfvers, this.client.mapNameChecksum);
    const events = this.client.clientEvents;

    const clientEvent = new ClientEvent(timeResult.time, timeResult.hasError, snapshot);

    let prevStat = 0;
    const newStat = snapshot.ps.stats[12];
    if (newStat < 0) return;

    if (events.length === 0) {
      clientEvent.eventStartFile = true;
      if (snapshot.ps.pm_type === ClientEvent.PlayerMode.PM_NORMAL) {
        if ((prevStat & 4) !== (newStat & 4) && (prevStat & 2) === 0) {
          clientEvent.eventStartTime = true;
        }
      }
    } else {
      const prevEvent = events[events.length - 1];
      if (prevEvent.playerNum !== snapshot.ps.clientNum) {
        clientEvent.eventChangeUser = true;
      }
      if (prevEvent.playerMode !== snapshot.ps.pm_type) {
        clientEvent.eventChangePmType = true;
      }
      prevStat = prevEvent.userStat;

      const isNormal = snapshot.ps.pm_type === ClientEvent.PlayerMode.PM_NORMAL;
      const prevIsNormal = prevEvent.playerMode === ClientEvent.PlayerMode.PM_NORMAL;

      if (prevStat !== newStat) {
        if ((prevStat & 4) !== (newStat & 4)) {
          if (isNormal) {
            if ((prevStat & 2) === 0) {
              clientEvent.eventStartTime = true;
            } else {
              clientEvent.eventTimeReset = true;
            }
          }
        } else if ((prevStat & 8) !== (newStat & 8)) {
          if ((isNormal || prevIsNormal) && !clientEvent.eventChangeUser) {
            clientEvent.eventFinish = true;
          }
        } else if ((prevStat & 16) !== (newStat & 16)) {
          if (isNormal) {
            clientEvent.eventCheckPoint = true;
          }
        } else if (prevEvent.eventFinish && (prevStat & 2) !== 0 && (newStat & 2) === 0) {
          // 0x2 bit clears in the snapshot after finish: re-attribute finish here for accurate timing
          if ((isNormal || prevIsNormal) && !clientEvent.eventChangeUser) {
            prevEvent.eventFinish = false;
            if (!prevEvent.hasAnyEvent) events.splice(events.length - 1, 1);
            clientEvent.eventFinish = true;
          }
        } else if (prevEvent.eventStartTime && (prevStat & 2) === 0 && (newStat & 2) !== 0) {
          // 0x2 bit sets in the snapshot after start: re-attribute start here for accurate timing
          if (isNormal) {
            prevEvent.eventStartTime = false;
            if (!prevEvent.hasAnyEvent) events.splice(events.length - 1, 1);
            clientEvent.eventStartTime = true;
          }
        } else if (prevEvent.eventTimeReset && (prevStat & 4) === 0 && (newStat & 2) !== 0) {
          // 0x2 bit sets in the snapshot after time reset: re-attribute reset here for accurate timing
          if (isNormal) {
            prevEvent.eventTimeReset = false;
            if (!prevEvent.hasAnyEvent) events.splice(events.length - 1, 1);
            clientEvent.eventTimeReset = true;
          }
        } else {
          clientEvent.eventSomeTrigger = true;
        }
      }
    }

    const vx = Math.abs(snapshot.ps.velocity[0]);
    const vy = Math.abs(snapshot.ps.velocity[1]);
    const speed = Math.sqrt(vx * vx + vy * vy);
    clientEvent.speed = Math.floor(speed);
    if (speed > this.client.maxSpeed) {
      this.client.maxSpeed = Math.floor(speed);
    }

    if (clientEvent.hasAnyEvent) {
      events.push(clientEvent);
    }

    if (this.client.clientConfig !== null && this.client.isCpmInParams === null) {
      const promode = Q3Utils.getOrZero(this.client.clientConfig, 'df_promode');
      this.client.isCpmInParams = promode > 0;
    }

    if (snapshot.ps.pm_flags >= 32768) {
      if (this.client.isCpmInSnapshots !== true) {
        this.client.isCpmInSnapshots = true;
      }
    } else {
      if (this.client.isCpmInSnapshots === null) {
        this.client.isCpmInSnapshots = false;
      }
    }

    if (
      (this.client.isCpmInParams === false && this.client.isCpmInSnapshots === true) ||
      (this.client.isCpmInParams === true && this.client.isCpmInSnapshots === false)
    ) {
      Q3Utils.printDebug(this.clc.errors, new ErrorMatchPhysics());
    }
  }

  private parsePacketEntities(decoder: Q3HuffmanReader, oldframe: CLSnapshot | null, newframe: CLSnapshot): void {
    newframe.parseEntitiesNum = this.client.parseEntitiesNum;
    newframe.numEntities = 0;
    let oldindex = 0;
    let oldnum = 0;
    let oldstate: EntityState | null = null;

    if (oldframe === null) {
      oldnum = 99999;
    } else {
      if (oldindex >= oldframe.numEntities) {
        oldnum = 99999;
      } else {
        oldstate = Q3Utils.getOrCreate(
          this.client.parseEntities,
          (oldframe.parseEntitiesNum + oldindex) & (Q3Const.MAX_PARSE_ENTITIES - 1),
          () => new EntityState(),
        );
        oldnum = oldstate.number;
      }
    }

    while (true) {
      const newnum = decoder.readNumBits(Q3Const.GENTITYNUM_BITS);

      if (newnum === Q3Const.MAX_GENTITIES - 1) {
        break;
      }

      if (decoder.isEOD()) {
        Q3Utils.printDebug(this.clc.errors, new ErrorParsePacketEntitiesEndOfMessage());
        return;
      }

      while (oldnum < newnum) {
        this.clDeltaEntity(decoder, newframe, oldnum, oldstate!, true);
        oldindex++;

        if (oldframe === null || oldindex >= oldframe.numEntities) {
          oldnum = 99999;
        } else {
          oldstate = Q3Utils.getOrCreate(
            this.client.parseEntities,
            (oldframe.parseEntitiesNum + oldindex) & (Q3Const.MAX_PARSE_ENTITIES - 1),
            () => new EntityState(),
          );
          oldnum = oldstate.number;
        }
      }

      if (oldnum === newnum) {
        this.clDeltaEntity(decoder, newframe, newnum, oldstate!, false);
        oldindex++;

        if (oldframe === null || oldindex >= oldframe.numEntities) {
          oldnum = 99999;
        } else {
          oldstate = Q3Utils.getOrCreate(
            this.client.parseEntities,
            (oldframe.parseEntitiesNum + oldindex) & (Q3Const.MAX_PARSE_ENTITIES - 1),
            () => new EntityState(),
          );
          oldnum = oldstate.number;
        }
        continue;
      }

      if (oldnum > newnum) {
        const es = Q3Utils.getOrCreate(this.client.entityBaselines, newnum, () => new EntityState());
        this.clDeltaEntity(decoder, newframe, newnum, es, false);
        continue;
      }
    }

    // Copy any remaining old-frame entities unchanged
    while (oldnum !== 99999) {
      this.clDeltaEntity(decoder, newframe, oldnum, oldstate!, true);
      oldindex++;

      if (oldframe === null || oldindex >= oldframe.numEntities) {
        oldnum = 99999;
      } else {
        oldstate = Q3Utils.getOrCreate(
          this.client.parseEntities,
          (oldframe.parseEntitiesNum + oldindex) & (Q3Const.MAX_PARSE_ENTITIES - 1),
          () => new EntityState(),
        );
        oldnum = oldstate.number;
      }
    }
  }

  private clDeltaEntity(
    decoder: Q3HuffmanReader,
    frame: CLSnapshot,
    newnum: number,
    old: EntityState,
    unchanged: boolean,
  ): void {
    const state = Q3Utils.getOrCreate(
      this.client.parseEntities,
      this.client.parseEntitiesNum & (Q3Const.MAX_PARSE_ENTITIES - 1),
      () => new EntityState(),
    );

    if (unchanged) {
      state.copy(old);
    } else {
      decoder.readDeltaEntity(state, newnum);
    }

    if (state.number === Q3Const.MAX_GENTITIES - 1) {
      return; // entity was delta-removed
    }

    this.client.parseEntitiesNum++;
    frame.numEntities++;
  }

  private getMapNameChecksum(mapName: string): number {
    if (!mapName) return 0;
    mapName = mapName.toLowerCase();
    let sum = 0;
    for (const c of mapName) {
      sum += c.charCodeAt(0);
    }
    return sum & 0xff;
  }

  private shr32(x: number, n: number): number {
    return (x >>> n) | 0;
  }

  private shl32(x: number, n: number): number {
    return (x << n) | 0;
  }

  private getTime(
    ps: PlayerState,
    snapServerTime: number,
    dfVer: number,
    mapNameChecksum: number,
  ): { time: number; hasError: boolean } {
    let hasError = false;
    let time = (this.shl32(ps.stats[7], 0x10) | (ps.stats[8] & 0xffff)) | 0;

    if (time === 0) {
      return { time: 0, hasError };
    }

    // Online demos (except dfver 190) and cheated demos at dfver >= 19112 are unencrypted
    if ((this.client.isOnline && dfVer !== 190) || (dfVer >= 19112 && this.client.isCheatsOn)) {
      return { time, hasError };
    }

    // XOR-based offline time decryption
    time = (time ^ (Math.abs(Math.floor(ps.origin[0])) & 0xffff)) | 0;
    time = (time ^ this.shl32(Math.abs(Math.floor(ps.velocity[0])), 0x10)) | 0;
    time = (time ^ (ps.stats[0] > 0 ? ps.stats[0] & 0xff : 150)) | 0;
    time = (time ^ this.shl32(ps.movementDir & 0xf, 0x1c)) | 0;

    // Byte-swap cascade
    for (let i = 0x18; i > 0; i -= 8) {
      const temp = (this.shr32(time, i) ^ this.shr32(time, i - 8)) & 0xff;
      time = ((time & ~this.shl32(0xff, i)) | this.shl32(temp, i)) | 0;
    }

    let local1c = this.shl32(snapServerTime, 2);
    local1c = (local1c + this.shl32(dfVer + mapNameChecksum, 8)) | 0;
    local1c = (local1c ^ this.shl32(snapServerTime, 0x18)) | 0;
    time = (time ^ local1c) | 0;

    local1c = this.shr32(time, 0x1c);
    local1c = (local1c | (this.shl32(~local1c, 4) & 0xff)) | 0;
    local1c = (local1c | this.shl32(local1c, 8)) | 0;
    local1c = (local1c | this.shl32(local1c, 0x10)) | 0;
    time = (time ^ local1c) | 0;

    const checkBits = this.shr32(time, 0x16) & 0x3f;
    time = (time & 0x3fffff) | 0;

    let local20 = 0;
    for (let l = 0; l < 3; l++) {
      local20 += this.shr32(time, 6 * l) & 0x3f;
    }
    local20 += this.shr32(time, 0x12) & 0xf;

    if (checkBits !== (local20 & 0x3f)) {
      hasError = true;
      Q3Utils.printDebug(this.clc.errors, new ErrorBadChecksum());
    }

    return { time, hasError };
  }
}
