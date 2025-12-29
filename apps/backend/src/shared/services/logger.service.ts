import { Injectable } from '@nestjs/common';
import { Logtail } from '@logtail/node';

@Injectable()
export class LoggerService {
  private logger: Logtail;

  constructor() {
    if (process.env.LOGTAIL_API_KEY) {
      this.logger = new Logtail(process.env.LOGTAIL_API_KEY, {
        endpoint: 'https://s1207863.eu-nbg-2.betterstackdata.com',
      });
    }
  }

  public info(message: string) {
    if (this.logger) {
      this.logger.info(message);
      this.logger.flush();
    }
  }

  public error(message: string) {
    if (this.logger) {
      this.logger.error(message);
      this.logger.flush();
    }
  }
}
