// export function unpack(format: string, data: string): number[] {
//   if (format === 'I*') {
//     const result: number[] = [];
//     const dataView = new DataView(new ArrayBuffer(data.length));
//     for (let i = 0; i < data.length; i++) {
//       dataView.setUint8(i, data.charCodeAt(i));
//     }
//     for (let i = 0; i < data.length / 4; i++) {
//       result.push(dataView.getUint32(i * 4, true)); // true for little-endian
//     }
//     return result;
//   } else {
//     throw new Error(`Unsupported format specifier: ${format}`);
//   }
// }

export function unpack(data: Buffer): number[] {
  const result: number[] = [];
  const dataView = new DataView(data.buffer);

  // console.log(data.length / 4);

  for (let i = 0; i < Math.floor(data.length / 4); i++) {
    // console.log(i);
    result.push(emulatePHPOverflow(dataView.getUint32(i * 4, true)));
  }

  console.log(result);

  return result;
}

function emulatePHPOverflow(value: number): number {
  const maxInt32 = 2147483647;

  if (value > maxInt32) {
    // Perform the overflow simulation
    value = -(maxInt32 - (value % maxInt32)) - 2;
  }

  return value;
}
