export class Q3DemoMessage {
  sequence: number;
  size: number;
  data: Buffer;

  constructor(sequence: number, size: number) {
    this.sequence = sequence;
    this.size = size;
  }
}
