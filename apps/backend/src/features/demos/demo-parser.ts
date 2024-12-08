import * as fs from 'fs';
import { DemoConfigInterface } from './demo-config.interface';

const Q3_MESSAGE_MAX_SIZE = 0x4000;
const Q3_MAX_STRING_CHARS = 1024;
const Q3_BIG_INFO_STRING = 8192;
const Q3_PERCENT_CHAR_BYTE = 37;
const Q3_DOT_CHAR_BYTE = 46;

export class DemoParser {
  public parseDemo(demoName: string): DemoConfigInterface | null {
    return Q3DemoParser.getFriendlyConfig(demoName);
  }
}

enum Q3Const {
  MAX_CONFIGSTRINGS = 1024,
  Q3_DEMO_CFG_FIELD_CLIENT = 0,
  Q3_DEMO_CFG_FIELD_GAME = 1,
  Q3_DEMO_CFG_FIELD_PLAYER = 544,
}

/**
 * Q3 server commands
 */
enum Q3_SVC {
  BAD = 0, // not used in demos
  NOP = 1, // not used in demos
  GAMESTATE = 2,
  CONFIGSTRING = 3, // only inside gamestate
  BASELINE = 4, // only inside gamestate
  SERVERCOMMAND = 5,
  DOWNLOAD = 6, // not used in demos
  SNAPSHOT = 7,
  EOF = 8,
}

const Q3_HUFFMAN_NYT_SYM = 0xffffffff;

class Q3HuffmanReader {
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
      bits *= -1;
    }

    const fragmentBits = bits & 7;

    if (fragmentBits !== 0) {
      value = this.stream.readBits(fragmentBits);
      bits -= fragmentBits;
    }

    if (bits > 0) {
      let decoded = 0;
      for (let i = 0; i < bits; i += 8) {
        const sym = Q3HuffmanMapperInstance.decodeSymbol(this.stream)!;

        if (sym === Q3_HUFFMAN_NYT_SYM) {
          return -1;
        }

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
    return bits === 8 ? Q3HuffmanMapperInstance.decodeSymbol(this.stream)! : this.readNumBits(bits);
  }

  readByte(): number {
    return Q3HuffmanMapperInstance.decodeSymbol(this.stream)!;
  }

  readShort(): number {
    return this.readNumBits(16);
  }

  readInt(): number {
    return this.readNumBits(32);
  }

  readLong(): number {
    return this.readNumBits(32);
  }

  readStringBase(limit: number, stopAtNewLine: boolean): string {
    const arr: number[] = [];
    for (let i = 0; i < limit; i++) {
      const byte = Q3HuffmanMapperInstance.decodeSymbol(this.stream)!;

      if (byte <= 0) {
        break;
      }

      if (stopAtNewLine && byte === 0x0a) {
        break;
      }

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

  readServerCommand(): { sequence: number; command: string } {
    return {
      sequence: this.readLong(),
      command: this.readString(),
    };
  }
}

class BitStreamReader {
  private data: number[];
  private bitLength: number;
  private currentBits: number;
  private bitIdx: number;

  constructor(data: Buffer) {
    this.bitLength = data.length * 8;
    this.data = Q3Utils.unpack(data);
    this.reset();
  }

  reset(): void {
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
    let currAmount = 32 - (intIdx & 31);
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
      skip -= currAmount;
      this.currentBits >>= skip;
    }

    return this.bitIdx;
  }
}

class Q3HuffmanMapper {
  private root: Q3HuffmanNode | null = null;

  constructor() {
    /*
     * this is packed map of q3-huffman tree
     * array contains bits sequences in reverse order, prefixed by bit. each value is the bit-coded path in tree,
     * while index of this array is the decoded value
     *
     * for example, the first one (having index 0) is '0x6' in hex and '110' in binary,
     * read them right-to-left : 0 (left node), 1 (right-node) => 0 (decoded value)
     *
     * second example: value  0x00A5 at index 16, 0xA5 = 10100101b, read bits in right-to-left order:
     * 1 (right), 0 (left), 1 (right), 0 (left), 0 (left), 1 (right), 0 (left) => 16 (decoded value)
     */
    const symtab: number[] = [
      0x0006, 0x003b, 0x00c8, 0x00ec, 0x01a1, 0x0111, 0x0090, 0x007f, 0x0035, 0x00b4, 0x00e9, 0x008b, 0x0093, 0x006d,
      0x0139, 0x02ac, 0x00a5, 0x0258, 0x03f0, 0x03f8, 0x05dd, 0x07f3, 0x062b, 0x0723, 0x02f4, 0x058d, 0x04ab, 0x0763,
      0x05eb, 0x0143, 0x024f, 0x01d4, 0x0077, 0x04d3, 0x0244, 0x06cd, 0x07c5, 0x07f9, 0x070d, 0x07cd, 0x0294, 0x05ac,
      0x0433, 0x0414, 0x0671, 0x06f0, 0x03f4, 0x0178, 0x00a7, 0x01c3, 0x01ef, 0x0397, 0x0153, 0x01b1, 0x020d, 0x0361,
      0x0207, 0x02f1, 0x0399, 0x0591, 0x0523, 0x02bc, 0x0344, 0x05f3, 0x01cf, 0x00d0, 0x00fc, 0x0084, 0x0121, 0x0151,
      0x0280, 0x0270, 0x033d, 0x0463, 0x06d7, 0x0771, 0x039d, 0x06ab, 0x05c7, 0x0733, 0x032c, 0x049d, 0x056b, 0x076b,
      0x05d3, 0x0571, 0x05e3, 0x0633, 0x04d7, 0x06cb, 0x0370, 0x02a8, 0x02c7, 0x0305, 0x02eb, 0x01d8, 0x02f3, 0x013c,
      0x03ab, 0x038f, 0x0297, 0x00b0, 0x0141, 0x034f, 0x005c, 0x0128, 0x02bd, 0x02c4, 0x0198, 0x028f, 0x010c, 0x01b3,
      0x0185, 0x018c, 0x0147, 0x0179, 0x00d9, 0x00c0, 0x0117, 0x0119, 0x014b, 0x01e1, 0x01a3, 0x0173, 0x016f, 0x00e8,
      0x0088, 0x00e5, 0x005f, 0x00a9, 0x00cc, 0x00fd, 0x010f, 0x0183, 0x0101, 0x0187, 0x0167, 0x01e7, 0x0157, 0x0174,
      0x03cb, 0x03c4, 0x0281, 0x024d, 0x0331, 0x0563, 0x0380, 0x07d7, 0x042b, 0x0545, 0x046b, 0x043d, 0x072b, 0x04f9,
      0x04e3, 0x0645, 0x052b, 0x0431, 0x07eb, 0x05b9, 0x0314, 0x05f9, 0x0533, 0x042c, 0x06dd, 0x05c1, 0x071d, 0x05d1,
      0x0338, 0x0461, 0x06e3, 0x0745, 0x066b, 0x04cd, 0x04cb, 0x054d, 0x0238, 0x07c1, 0x063d, 0x07bc, 0x04c5, 0x07ac,
      0x07e3, 0x0699, 0x07d3, 0x0614, 0x0603, 0x05bc, 0x069d, 0x0781, 0x0663, 0x048d, 0x0154, 0x0303, 0x015d, 0x0060,
      0x0089, 0x07c7, 0x0707, 0x01b8, 0x03f1, 0x062c, 0x0445, 0x0403, 0x051d, 0x05c5, 0x074d, 0x041d, 0x0200, 0x07b9,
      0x04dd, 0x0581, 0x050d, 0x04b9, 0x05cd, 0x0794, 0x05bd, 0x0594, 0x078d, 0x0558, 0x07bd, 0x04c1, 0x07dd, 0x04f8,
      0x02d1, 0x0291, 0x0499, 0x06f8, 0x0423, 0x0471, 0x06d3, 0x0791, 0x00c9, 0x0631, 0x0507, 0x0661, 0x0623, 0x0118,
      0x0605, 0x06c1, 0x05d7, 0x04f0, 0x06c5, 0x0700, 0x07d1, 0x07a8, 0x061d, 0x0d00, 0x0405, 0x0758, 0x06f9, 0x05a8,
      0x06b9, 0x068d, 0x00af, 0x0064,
    ];

    this.root = new Q3HuffmanNode();

    for (const [sym, path] of symtab.entries()) {
      this.putSym(sym, path);
    }
  }

  public decodeSymbol(reader: BitStreamReader): number | null {
    let node = this.root;

    while (node !== null && node.symbol === Q3_HUFFMAN_NYT_SYM) {
      const bit = reader.nextBit();

      if (bit < 0) return null;

      node = bit == 0 ? node.left : node.right;
    }

    return node === null ? Q3_HUFFMAN_NYT_SYM : node.symbol;
  }

  private putSym(sym: number, path: number): void {
    let node = this.root;

    while (path > 1) {
      if (path & 0x1) {
        if (node!.right === null) {
          node!.right = new Q3HuffmanNode();
        }

        node = node!.right;
      } else {
        if (node!.left === null) {
          node!.left = new Q3HuffmanNode();
        }

        node = node!.left;
      }
      path >>= 1;
    }
    node!.symbol = sym;
  }
}

class Q3HuffmanNode {
  public left: Q3HuffmanNode | null;
  public right: Q3HuffmanNode | null;
  public symbol: number;

  constructor() {
    this.symbol = Q3_HUFFMAN_NYT_SYM;
    this.left = null;
    this.right = null;
  }
}

export class Q3DemoParser {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public parseConfig(): Record<number, string> | undefined | null {
    const msgParser = new Q3DemoConfigParser();

    this.doParse(msgParser);

    return msgParser.hasConfigs() ? msgParser.getRawConfigs() : null;
  }

  private doParse(msgParser: Q3DemoConfigParser): Q3DemoConfigParser {
    const messageStream = new Q3MessageStream(this.fileName);

    try {
      let msg: Q3DemoMessage | null = null;
      while ((msg = messageStream.nextMessage()) !== null) {
        if (!msgParser.parse(msg)) {
          break;
        }
      }
    } catch (error) {
      // Handle exceptions
    }

    messageStream.close();

    return msgParser;
  }

  public static getRawConfigStrings(fileName: string): Record<number, string> | undefined | null {
    return new Q3DemoParser(fileName).parseConfig();
  }

  public static getFriendlyConfig(fileName: string): DemoConfigInterface | null {
    const rawConfigStrings: Record<number, string> | undefined | null = Q3DemoParser.getRawConfigStrings(fileName);

    if (!rawConfigStrings) {
      return null;
    }

    const playerRawString: string | undefined = rawConfigStrings[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER];
    const client: DemoConfigInterface['client'] = Q3Utils.splitConfig(
      rawConfigStrings[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT],
    );
    const player: DemoConfigInterface['player'] = playerRawString
      ? Q3Utils.splitConfig<{ hc: string }>(playerRawString)
      : null;

    return {
      client,
      physic: client.df_promode === '0' ? 'vq3' : 'cpm',
      game: Q3Utils.splitConfig<DemoConfigInterface['game']>(rawConfigStrings[Q3Const.Q3_DEMO_CFG_FIELD_GAME]),
      player,
      raw: rawConfigStrings,
    } as DemoConfigInterface;
  }
}

class Q3DemoMessage {
  public sequence: number;
  public size: number;
  public data: Buffer;

  constructor(sequence: number, size: number) {
    this.sequence = sequence;
    this.size = size;
  }
}

class Q3MessageStream {
  private fileHandle: number | null = null;
  private readBytes: number = 0;
  private readMessages: number = 0;

  constructor(fileName: string) {
    this.readBytes = 0;
    this.readMessages = 0;

    try {
      this.fileHandle = this.openFile(fileName);
    } catch (error) {
      throw new Error(`Can't open demofile ${fileName}...`);
    }
  }

  private openFile(fileName: string): number {
    const handle = fs.openSync(fileName, 'r');

    if (handle === null) throw new Error(`Can't open demofile ${fileName}...`);

    return handle;
  }

  /**
   * @return Q3DemoMessage return a next message buffer or null if EOD is reached
   * @throws Error in case stream is corrupted
   */
  public nextMessage(): Q3DemoMessage | null {
    if (!this.fileHandle) {
      return null;
    }

    const header_buffer = this.readFromFile(8);

    if (!header_buffer || header_buffer.length !== 8) {
      return null;
    }

    this.readBytes += 8;
    const header = this.unpackHeader(header_buffer);
    const sequence = header[0];
    const msgLength = header[1];

    if (sequence === -1 && msgLength === -1) {
      // a normal case, end of message-sequence
      return null;
    }

    if (msgLength < 0 || msgLength > Q3_MESSAGE_MAX_SIZE) {
      throw new Error(`Demo file is corrupted, wrong message length: ${msgLength}`);
    }

    const msg = new Q3DemoMessage(sequence, msgLength);
    msg.data = this.readFromFile(msgLength);

    if (!msg.data) {
      throw new Error('Unable to read demo-message, corrupted file?');
    }

    this.readBytes += msgLength;
    this.readMessages++;

    return msg;
  }

  private readFromFile(bytes: number): Buffer {
    if (!this.fileHandle) {
      return Buffer.alloc(0);
    }

    const buffer = Buffer.alloc(bytes);
    const bytesRead = fs.readSync(this.fileHandle, buffer, 0, bytes, null);

    if (bytesRead !== bytes) {
      return Buffer.alloc(0);
    }

    return buffer;
  }

  private unpackHeader(buffer: Buffer): [number, number] {
    const sequence = buffer.readInt32LE(0);
    const msgLength = buffer.readInt32LE(4);

    return [sequence, msgLength];
  }

  public close(): void {
    if (this.fileHandle) {
      fs.closeSync(this.fileHandle);
      this.fileHandle = null;
    }
  }

  public getReadBytes(): number {
    return this.readBytes;
  }

  public getReadMessages(): number {
    return this.readMessages;
  }

  public destructor(): void {
    this.close();
  }
}

class Q3Utils {
  public static splitConfig<T extends Record<string, string>>(src: string): T {
    const begin_ind = src[0] === '\\' ? 1 : 0;
    const srcParts = src.split('\\');
    const result: Record<string, string> = {};

    for (let k = begin_ind; k < srcParts.length; k += 2) {
      result[srcParts[k].toLowerCase()] = srcParts[k + 1];
    }

    return result as T;
  }

  public static unpack(data: Buffer): number[] {
    const result: number[] = [];
    const dataView = new DataView(data.buffer);

    for (let i = 0; i < Math.floor(data.length / 4); i++) {
      result.push(Q3Utils.emulatePHPOverflow(dataView.getUint32(i * 4, true)));
    }

    return result;
  }

  public static emulatePHPOverflow(value: number): number {
    const maxInt32 = 2147483647;

    if (value > maxInt32) {
      value = -(maxInt32 - (value % maxInt32)) - 2;
    }

    return value;
  }
}

class Q3DemoConfigParser {
  private configs?: Record<number, string>;

  hasConfigs(): boolean {
    return this.configs !== undefined;
  }

  getRawConfigs(): Record<number, string> | undefined {
    return this.configs;
  }

  parse(message: Q3DemoMessage): boolean {
    const reader = new Q3HuffmanReader(message.data);

    reader.readLong();

    while (!reader.isEOD()) {
      switch (reader.readByte()) {
        case Q3_SVC.BAD:
        case Q3_SVC.NOP:
          return false;

        case Q3_SVC.EOF:
          return this.configs !== undefined;

        case Q3_SVC.SERVERCOMMAND:
          reader.readServerCommand();
          break;

        case Q3_SVC.GAMESTATE:
          this.parseGameState(reader);
          return this.configs !== undefined;

        case Q3_SVC.SNAPSHOT:
          return false;

        default:
          return false;
      }
    }

    return true;
  }

  private parseGameState(reader: Q3HuffmanReader): void {
    reader.readLong();

    while (true) {
      const cmd = reader.readByte();
      if (cmd === Q3_SVC.EOF) break;

      switch (cmd) {
        case Q3_SVC.CONFIGSTRING:
          const key = reader.readShort();

          if (key < 0 || key > Q3Const.MAX_CONFIGSTRINGS) {
            return;
          }
          if (!this.configs) this.configs = {};

          this.configs[key] = reader.readBigString();
          break;

        case Q3_SVC.BASELINE:
          return;

        default:
          return;
      }
    }

    reader.readLong();
    reader.readLong();
  }
}

const Q3HuffmanMapperInstance = new Q3HuffmanMapper();
