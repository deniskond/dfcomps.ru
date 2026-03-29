export class Q3Utils {
  static splitConfig(src: string): Record<string, string> {
    const beginInd = src[0] === '\\' ? 1 : 0;
    const parts = src.split('\\');
    const result: Record<string, string> = {};
    for (let k = beginInd; k < parts.length - 1; k += 2) {
      const key = parts[k];
      const value = parts[k + 1];
      if (value) {
        result[key] = value;
      }
    }
    return result;
  }

  static rawBitsToFloat(bits: number): number {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setInt32(0, bits | 0, true);
    return new DataView(buf).getFloat32(0, true);
  }

  static SHORT2ANGLE(x: number): number {
    return x * (360.0 / 65536.0);
  }

  static ANGLE2SHORT(x: number): number {
    return ((x * 65536.0 / 360.0) | 0) & 65535;
  }

  static emulatePHPOverflow(value: number): number {
    return value | 0;
  }

  static unpack(data: Buffer): number[] {
    const result: number[] = [];
    // Pad to next 4-byte boundary (matching C# behaviour which always pads with zeros)
    const addBytes = 4 - (data.length & 3);
    const padded = Buffer.alloc(data.length + addBytes);
    data.copy(padded);
    const dataView = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
    for (let i = 0; i < padded.length / 4; i++) {
      result.push(Q3Utils.emulatePHPOverflow(dataView.getUint32(i * 4, true)));
    }
    return result;
  }

  static getOrZero(dict: Record<string, string>, key: string): number {
    return parseInt(dict[key] ?? '0', 10) || 0;
  }

  static getOrNull(dict: Record<string, string>, key: string): string | null {
    return dict[key] ?? null;
  }

  static getOrCreate<T>(dict: Record<number, T>, key: number, factory: () => T): T {
    if (dict[key] === undefined) {
      dict[key] = factory();
    }
    return dict[key];
  }

  static printDebug(errors: Record<string, null>, error: Error): void {
    errors[error.message] = null;
  }
}
