import { Q3_HUFFMAN_NYT_SYM, Q3_MAX_STRING_CHARS, Q3_BIG_INFO_STRING, Q3_PERCENT_CHAR_BYTE, Q3_DOT_CHAR_BYTE } from '../const/constants';
import { Q3Const } from '../const/q3-const';
import { EntityState } from '../structures/entity-state';
import { MapperFactory } from '../structures/mapper-factory';
import { PlayerState } from '../structures/player-state';
import { BitStreamReader } from '../utils/bit-stream-reader';
import { Q3Utils } from '../utils/q3-utils';
import { Q3HuffmanMapper } from './q3-huffman-mapper';

export class Q3HuffmanReader {
  private stream: BitStreamReader;

  constructor(buffer: Buffer) {
    this.stream = new BitStreamReader(buffer);
  }

  isEOD(): boolean {
    return this.stream.isEOD();
  }

  readNumBits(bits: number): number {
    let value = 0;
    const neg = bits < 0;

    if (neg) {
      bits = -bits;
    }

    const fragmentBits = bits & 7;

    if (fragmentBits !== 0) {
      value = this.stream.readBits(fragmentBits);
      bits -= fragmentBits;
    }

    if (bits > 0) {
      let decoded = 0;
      for (let i = 0; i < bits; i += 8) {
        const sym = Q3HuffmanMapper.decodeSymbol(this.stream);
        if (sym === Q3_HUFFMAN_NYT_SYM) return -1;
        decoded |= sym << i;
      }

      if (fragmentBits > 0) {
        decoded <<= fragmentBits;
      }

      value |= decoded;
    }

    if (neg) {
      if ((value & (1 << (bits - 1))) !== 0) {
        value |= -1 ^ ((1 << bits) - 1);
      }
    }

    return value;
  }

  readNumber(bits: number): number {
    return bits === 8 ? Q3HuffmanMapper.decodeSymbol(this.stream) : this.readNumBits(bits);
  }

  readByte(): number {
    return Q3HuffmanMapper.decodeSymbol(this.stream);
  }

  readShort(): number {
    const val = this.readNumBits(16);
    // Sign-extend from 16 bits to match C# (short) cast behaviour
    return (val << 16) >> 16;
  }

  readInt(): number {
    return this.readNumBits(32);
  }

  readLong(): number {
    return this.readNumBits(32);
  }

  readFloat(): number {
    const ival = this.readNumBits(32);
    if (this.isEOD()) return -1;
    return Q3Utils.rawBitsToFloat(ival);
  }

  readAngle16(): number {
    return Q3Utils.SHORT2ANGLE(this.readNumBits(16));
  }

  readFloatIntegral(): number {
    if (this.readNumBits(1) === 0) {
      const trunc = this.readNumBits(Q3Const.FLOAT_INT_BITS);
      return trunc - Q3Const.FLOAT_INT_BIAS;
    } else {
      return this.readFloat();
    }
  }

  readData(data: number[], len: number): void {
    const limit = Math.min(len, data.length);
    for (let i = 0; i < limit; i++) {
      data[i] = this.readByte();
    }
  }

  readStringBase(limit: number, stopAtNewLine: boolean): string {
    const arr: number[] = [];

    for (let i = 0; i < limit; i++) {
      const byte = Q3HuffmanMapper.decodeSymbol(this.stream);

      if (byte <= 0) break;
      if (stopAtNewLine && byte === 0x0a) break;

      if (byte > 127 || byte === Q3_PERCENT_CHAR_BYTE) {
        arr.push(Q3_DOT_CHAR_BYTE);
      } else {
        arr.push(byte);
      }
    }

    return String.fromCharCode(...arr);
  }

  readString(): string {
    return this.readStringBase(Q3_MAX_STRING_CHARS, false);
  }

  readBigString(): string {
    return this.readStringBase(Q3_BIG_INFO_STRING, false);
  }

  readStringLine(): string {
    return this.readStringBase(Q3_MAX_STRING_CHARS, true);
  }

  readDeltaEntity(state: EntityState, number: number): boolean {
    if (this.readNumBits(1) === 1) {
      state.number = Q3Const.MAX_GENTITIES - 1;
      return true;
    }

    // no delta
    if (this.readNumBits(1) === 0) {
      state.number = number;
      return true;
    }

    const lc = this.readByte();
    if (lc < 0 || lc > MapperFactory.EntityStateFieldNum) {
      return false;
    }

    state.number = number;
    for (let i = 0; i < lc; i++) {
      if (this.readNumBits(1) === 0) {
        continue; // no change
      }
      const reset = this.readNumBits(1) === 0;
      MapperFactory.updateEntityState(state, i, this, reset);
    }

    return true;
  }

  readDeltaPlayerState(state: PlayerState): boolean {
    const lc = this.readByte();
    if (lc < 0 || lc > MapperFactory.PlayerStateFieldNum) {
      return false;
    }

    for (let i = 0; i < lc; i++) {
      if (this.readNumBits(1) === 0) {
        continue; // no change
      }
      MapperFactory.updatePlayerState(state, i, this, false);
    }

    // read arrays
    if (this.readNumBits(1) !== 0) {
      if (this.readNumBits(1) !== 0) {
        this.pstArrayRead(state.stats, Q3Const.MAX_STATS);
      }
      if (this.readNumBits(1) !== 0) {
        this.pstArrayRead(state.persistant, Q3Const.MAX_PERSISTANT);
      }
      if (this.readNumBits(1) !== 0) {
        this.pstArrayRead(state.ammo, Q3Const.MAX_WEAPONS);
      }
      if (this.readNumBits(1) !== 0) {
        this.pstLongArrayRead(state.powerups, Q3Const.MAX_POWERUPS);
      }
    }

    return true;
  }

  private pstArrayRead(arr: number[], maxbits: number): void {
    const bits = this.readNumBits(maxbits);
    for (let i = 0; i < maxbits; i++) {
      if (bits & (1 << i)) {
        arr[i] = this.readShort();
      }
    }
  }

  private pstLongArrayRead(arr: number[], maxbits: number): void {
    const bits = this.readNumBits(maxbits);
    for (let i = 0; i < maxbits; i++) {
      if (bits & (1 << i)) {
        arr[i] = this.readLong();
      }
    }
  }
}
