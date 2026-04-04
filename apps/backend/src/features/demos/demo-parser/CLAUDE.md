# Demo Parser — Architecture Reference

This folder contains the complete Q3 `.dm_68` demo parser which output is used for validating correct configuration for recorded demos and to extract time and maximum speed from demo.

---

## Folder Structure

```
demo-parser/
  demo-parser.ts          # NestJS @Injectable service — entry point for the app
  CLAUDE.md               # this file

  parser/
    q3-demo-parser.ts         # top-level parser: opens file, feeds messages
    q3-demo-config-parser.ts  # core message parser: GAMESTATE / SNAPSHOT / SERVERCOMMAND
    q3-demo-message.ts        # data structure for a single raw message
    q3-message-stream.ts      # reads 8-byte message headers and decompresses payloads

  huffman/
    q3-huffman-reader.ts      # high-level typed reads (readByte, readShort, readLong, readString, readDeltaPlayerState, ...)
    q3-huffman-mapper.ts      # builds the static Huffman tree used by Q3
    q3-huffman-node.ts        # Huffman tree node

  utils/
    bit-stream-reader.ts      # bit-level reader over a uint32[] buffer
    q3-utils.ts               # helpers: splitConfig, unpack, emulatePHPOverflow, ...
    parser-ex.ts              # typed error classes

  const/
    q3-const.ts               # numeric constants (config string indices, MAX_CONFIGSTRINGS, ...)
    q3-svc.ts                 # SVC command byte values (GAMESTATE, SNAPSHOT, SERVERCOMMAND, ...)
    constants.ts              # misc constants (Q3_MESSAGE_MAX_SIZE, Huffman symbols, ...)

  structures/
    client-connection.ts      # CLC: configs[], console[], clientNum, serverMessageSequence
    client-state.ts           # client-side parsed state: clientEvents[], maxSpeed, isCpmInParams, ...
    client-event.ts           # one detected gameplay event (start, finish, checkpoint, ...)
    cl-snapshot.ts            # one parsed snapshot
    player-state.ts           # full PlayerState with copy()
    entity-state.ts           # entity state for non-player entities
    mapper-factory.ts         # field index → PlayerState field mapping for delta reads
    trajectory.ts / trajectory-type.ts  # entity trajectory structures
    raw-info.ts               # thin wrapper returned by Q3DemoParser.getRawInfo()
```

---

## Data Flow

```
.dm_68 file
  └─ Q3MessageStream          reads 8-byte headers (seq + len), returns raw byte buffers
       └─ Q3DemoConfigParser  feeds each buffer through Q3HuffmanReader
            ├─ GAMESTATE      populates clc.configs[] (raw config strings keyed by index)
            ├─ SERVERCOMMAND  populates clc.console[] (server print/command history)
            └─ SNAPSHOT       parses delta-compressed player state; calls updateClientEvents()
                 └─ updateClientEvents()  emits ClientEvent records based on stats[12] changes

RawInfo { clc, client }
  └─ DemoParser.parseDemo()   (NestJS service)
       ├─ buildRecord()        derives bestTime, spectatorRecorded, lateStart, ...
       └─ buildTimer()         parses TimerStopped console command for CP/finish times
```

---

## Binary Format

### Message header (8 bytes, little-endian)
| Offset | Size | Field          |
|--------|------|----------------|
| 0      | 4    | sequence number |
| 4      | 4    | payload length  |

The payload immediately follows and is Huffman-compressed.

### Huffman decoding
`Q3HuffmanMapper` builds the static Q3 Huffman tree once at startup. `Q3HuffmanReader` wraps a `BitStreamReader` and calls `decodeSymbol()` to read one byte at a time.

`BitStreamReader` operates on a `uint32[]` array produced by `Q3Utils.unpack()`. Its state is `(bitIdx, currentBits)` where `currentBits` always holds the 32-bit group that contains the next bit to read, right-shifted so the next bit is at bit 0.

**Critical padding requirement in `unpack()`**: The input buffer must be padded to the next multiple of 4 bytes with zeros before slicing into `uint32` groups. C# does this unconditionally. Without padding, the last partial group is inaccessible, causing stream desync for any message whose payload length is not a multiple of 4.

**Critical boundary case in `readBits()`**: After consuming exactly the last bit of a 32-bit group, the next group must be pre-loaded into `currentBits` even when `bits == 0` on exit. This is handled by the `else if ((intIdx & 31) === 0)` branch.

---

## GAMESTATE Parsing

Reads pairs of `(configStringIndex: short, value: bigString)` until `SVC_EOF`. Stored in `clc.configs[index]`.

Key config string indices (see `Q3Const`):
- `Q3_DEMO_CFG_FIELD_CLIENT` (0) — client settings: `df_promode`, physics
- `Q3_DEMO_CFG_FIELD_GAME` (1) — game settings
- `Q3_DEMO_CFG_FIELD_PLAYER` (544) — base player config; player N is at 544+N
- Indices 529–543 — additional player configs

---

## SNAPSHOT Parsing

Each snapshot carries a delta-compressed `PlayerState` relative to the previous snapshot (or baseline). The process:

1. Read snapshot header (server time, delta frame, flags, area mask).
2. Copy previous snapshot's PlayerState: `newSnap.ps.copy(old.ps)`.
3. Call `readDeltaPlayerState()` to apply only changed fields.
4. Call `updateClientEvents()` to detect gameplay events.

### `readDeltaPlayerState()` (in `Q3HuffmanReader`)
- Reads `lc` byte: number of mapped fields that follow.
- For each field index 0..lc-1: reads 1 change-flag bit; if set, reads the field value using its type (float, int, short, etc.) from `MapperFactory`.
- Reads four 16-bit-masked arrays: `stats[16]`, `persistant[16]`, `ammo[16]`, `powerups[16]` via `pstArrayRead()`.

### `pstArrayRead()`
Reads a 16-bit bitmask. For each set bit position i, reads a `short` and stores it in `ps.array[i]`.

---

## Event Detection (`updateClientEvents`)

Events are signalled by bit changes in `stats[12]`:

| Bit  | Event                          |
|------|--------------------------------|
| 0x4  | Timer started (start) or Time Reset |
| 0x8  | Finish                         |
| 0x10 | Checkpoint                     |

`SomeTrigger` is any of the above bits being set (transition from 0 to 1).

Additionally:
- `eventStartFile` — emitted once at the very first snapshot (file recording began)
- `eventChangePmType` — emitted when `ps.pm_type` changes
- `eventChangeUser` — emitted when the recording client's player number changes

### Time decryption
Finish/checkpoint times stored in `stats[0]` and `stats[1]` are XOR-encrypted for offline demos:
- Key = `pm_flags & 0xFF`
- `time = (stats[0] ^ key) | ((stats[1] ^ key) << 16)`

For online demos (`isOnline`) or cheated demos with `dfVers >= 19112`, the value is stored unencrypted (no XOR).

### Speed tracking
`maxSpeed` is the maximum `sqrt(vx²+vy²)` observed across all snapshots.

---

## High-Level Output (`DemoParser.parseDemo`)

`DemoParser` is a NestJS `@Injectable()` service. `parseDemo(filePath)` returns `DemoConfigInterface | null`.

### `buildRecord()`
Produces the `record` section:
- `demoname` — basename of file
- `date` — from last `print "Date:` server command
- `time` / `time N` — finish-time console messages (server print lines)
- `bestTime` — computed from the best valid `ClientEvent` with `eventFinish`; marked `(Time reset)` if preceded by a TR
- `maxSpeed`
- `spectatorRecorded` — set when the file-start player name differs from the timer-start player name
- `lateStart` — set when the timer starts more than 20 s after file recording started

### `buildTimer()`
Parses the last `TimerStopped` server command:
```
TimerStopped <total_ms> <cp_count> [cp1_ms cp2_ms ...] [Stats pmoveDepends pmove_fixed sv_fps com_maxfps g_sync [pmove_msec] all_weapons no_damage enable_powerups]
```
Produces `CheckPoint`, `CheckPoint 2`, ..., `FinishTimer` with segment diffs, plus server-side physics stats.

`timereset = true` if more than one `TimerStarted` command preceded this `TimerStopped` (i.e. the player used Time Reset).
