export function unpack(data: Buffer): number[] {
  const result: number[] = [];
  const dataView = new DataView(data.buffer);

  for (let i = 0; i < Math.floor(data.length / 4); i++) {
    result.push(emulatePHPOverflow(dataView.getUint32(i * 4, true)));
  }

  return result;
}

function emulatePHPOverflow(value: number): number {
  const maxInt32 = 2147483647;

  if (value > maxInt32) {
    value = -(maxInt32 - (value % maxInt32)) - 2;
  }

  return value;
}
