import { Q3Utils } from './q3-utils';

export class BitStreamReader {
  private data: number[];
  private bitLength: number;
  private currentBits: number;
  private bitIdx: number;

  constructor(data: Buffer) {
    this.bitLength = data.length * 8;
    this.data = Q3Utils.unpack(data);
    this.bitIdx = 0;
    this.currentBits = this.data[0];
  }

  isEOD(): boolean {
    return this.bitIdx >= this.bitLength;
  }

  readBits(bits: number): number {
    if (bits < 0 || bits > 32 || this.bitIdx + bits > this.bitLength) {
      return -1;
    }

    let value = 0;
    let setBit = 1;
    let intIdx = this.bitIdx;
    let intBits = this.currentBits;
    const currAmount = 32 - (intIdx & 31);
    let tread = bits > currAmount ? currAmount : bits;

    bits -= tread;
    intIdx += tread;

    while (tread > 0) {
      if (intBits & 1) {
        value |= setBit;
      }
      setBit <<= 1;
      intBits >>= 1;
      --tread;
    }

    if (bits > 0) {
      intBits = this.data[Math.floor(intIdx / 32)];
      intIdx += bits;

      while (bits > 0) {
        if (intBits & 1) {
          value |= setBit;
        }
        setBit <<= 1;
        intBits >>= 1;
        --bits;
      }
    } else if ((intIdx & 31) === 0) {
      intBits = this.data[Math.floor(intIdx / 32)];
    }

    this.currentBits = intBits;
    this.bitIdx = intIdx;

    return value;
  }

  nextBit(): number {
    if (this.bitIdx >= this.bitLength) {
      return -1;
    }

    const rez = this.currentBits & 1;

    ++this.bitIdx;

    if (this.bitIdx & 31) {
      this.currentBits >>= 1;
    } else {
      this.currentBits = this.data[Math.floor(this.bitIdx / 32)];
    }

    return rez;
  }

  skipBits(skip: number): number {
    if (skip < 0 || skip > 32 || this.bitIdx + skip > this.bitLength) {
      return -1;
    }

    const currAmount = 32 - (this.bitIdx & 31);
    this.bitIdx += skip;

    if (currAmount > skip) {
      this.currentBits >>= skip;
    } else {
      this.currentBits = this.data[Math.floor(this.bitIdx / 32)];
      const rem = skip - currAmount;
      this.currentBits >>= rem;
    }

    return this.bitIdx;
  }
}
