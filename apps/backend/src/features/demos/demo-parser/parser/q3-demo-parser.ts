import { RawInfo } from '../structures/raw-info';
import { Q3DemoConfigParser } from './q3-demo-config-parser';
import { Q3MessageStream } from './q3-message-stream';

export class Q3DemoParser {
  constructor(private fileName: string) {}

  parseConfig(): RawInfo {
    const msgParser = new Q3DemoConfigParser();
    this.doParse(msgParser);
    return new RawInfo(this.fileName, msgParser.clc, msgParser.client);
  }

  private doParse(msgParser: Q3DemoConfigParser): void {
    const messageStream = new Q3MessageStream(this.fileName);

    try {
      let msg = messageStream.nextMessage();
      while (msg !== null) {
        msgParser.parse(msg);
        msg = messageStream.nextMessage();
      }
    } catch {
      // stream errors logged inside parser
    }

    messageStream.close();
  }

  static getRawInfo(fileName: string): RawInfo {
    return new Q3DemoParser(fileName).parseConfig();
  }
}
