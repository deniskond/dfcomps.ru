import * as fs from 'fs';
import { Q3_MESSAGE_MAX_SIZE } from '../const/constants';
import { ErrorCantOpenFile, ErrorWrongLength } from '../utils/parser-ex';
import { Q3DemoMessage } from './q3-demo-message';

export class Q3MessageStream {
  private fileHandle: number | null = null;

  constructor(fileName: string) {
    try {
      this.fileHandle = fs.openSync(fileName, 'r');
    } catch {
      throw new ErrorCantOpenFile();
    }
  }

  nextMessage(): Q3DemoMessage | null {
    if (!this.fileHandle) return null;

    const headerBuffer = Buffer.alloc(8);
    const bytesRead = fs.readSync(this.fileHandle, headerBuffer, 0, 8, null);

    if (bytesRead !== 8) return null;

    const sequence = headerBuffer.readInt32LE(0);
    const msgLength = headerBuffer.readInt32LE(4);

    if (sequence === -1 && msgLength === -1) {
      return null;
    }

    if (msgLength < 0 || msgLength > Q3_MESSAGE_MAX_SIZE) {
      throw new ErrorWrongLength();
    }

    const msg = new Q3DemoMessage(sequence, msgLength);
    const dataBuffer = Buffer.alloc(msgLength);
    const dataRead = fs.readSync(this.fileHandle, dataBuffer, 0, msgLength, null);

    if (dataRead !== msgLength) {
      return null;
    }

    msg.data = dataBuffer;
    return msg;
  }

  close(): void {
    if (this.fileHandle !== null) {
      fs.closeSync(this.fileHandle);
      this.fileHandle = null;
    }
  }
}
